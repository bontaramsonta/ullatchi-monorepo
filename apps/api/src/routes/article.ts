import { Hono } from "hono";
import { articleSubmissionSchema } from "@ullatchi/types";
import { getSanityClient } from "../lib/sanity";
import { generateSlug, generateKey } from "../lib/utils";

function isValidPortableTextContent(
  content: unknown
): content is Array<{ _type: string; _key?: string }> {
  if (!Array.isArray(content)) return false;
  if (content.length === 0) return false;
  return content.every((block) => {
    if (typeof block !== "object" || block === null) return false;
    if (!("_type" in block)) return false;
    return true;
  });
}

function normalizePortableTextContent(
  content: Array<{ _type: string; _key?: string; [key: string]: unknown }>
): Array<{ _type: string; _key: string; [key: string]: unknown }> {
  return content.map((block) => {
    const normalizedBlock = { ...block, _key: block._key || generateKey() };

    if ("children" in normalizedBlock && Array.isArray(normalizedBlock.children)) {
      normalizedBlock.children = normalizedBlock.children.map(
        (child: { _key?: string; [key: string]: unknown }) => ({
          ...child,
          _key: child._key || generateKey(),
        })
      );
    }

    if ("markDefs" in normalizedBlock && Array.isArray(normalizedBlock.markDefs)) {
      normalizedBlock.markDefs = normalizedBlock.markDefs.map(
        (def: { _key?: string; [key: string]: unknown }) => ({
          ...def,
          _key: def._key || generateKey(),
        })
      );
    }

    return normalizedBlock;
  });
}

export const articleRoutes = new Hono().basePath("/api");

articleRoutes.post("/submit-article", async (c) => {
  try {
    const body = await c.req.parseBody();

    const formData = {
      title: body.title as string,
      description: body.description as string | undefined,
      cardDescription: body.cardDescription as string | undefined,
      content: body.content as string,
      authorName: body.authorName as string,
      authorBio: body.authorBio as string | undefined,
    };

    const result = articleSubmissionSchema.safeParse(formData);
    if (!result.success) {
      return c.json({ error: result.error.issues[0].message }, 400);
    }

    const {
      title,
      description,
      cardDescription,
      content: rawContent,
      authorName,
      authorBio,
    } = result.data;

    let content: unknown;
    try {
      content = JSON.parse(rawContent);
    } catch {
      return c.json({ error: "Invalid content format" }, 400);
    }

    if (!isValidPortableTextContent(content)) {
      return c.json({ error: "Invalid content structure" }, 400);
    }

    const normalizedContent = normalizePortableTextContent(content);

    const profileImageFile = body.profileImage as File | undefined;

    if (profileImageFile && profileImageFile.size > 0) {
      const maxSize = 10 * 1024 * 1024;
      if (profileImageFile.size > maxSize) {
        return c.json({ error: "Profile image must be less than 10MB" }, 400);
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(profileImageFile.type)) {
        return c.json(
          { error: "Profile image must be a valid image format (JPEG, PNG, GIF, or WebP)" },
          400
        );
      }
    }

    const client = getSanityClient();

    let profileImageAssetId: string | null = null;
    if (profileImageFile && profileImageFile.size > 0) {
      const arrayBuffer = await profileImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const asset = await client.assets.upload("image", buffer, {
        filename: profileImageFile.name || "profile-image",
      });
      profileImageAssetId = asset._id;
    }

    const authorData = {
      _type: "author" as const,
      displayName: authorName,
      ...(authorBio && { bio: authorBio }),
      ...(profileImageAssetId && {
        profileImage: {
          _type: "image" as const,
          asset: { _type: "reference" as const, _ref: profileImageAssetId },
        },
      }),
    };

    const createdAuthor = await client.create(authorData);

    const slug = generateSlug(title);

    const articleData = {
      _type: "article" as const,
      title,
      slug: { _type: "slug" as const, current: slug },
      ...(description && { description }),
      ...(cardDescription && { cardDescription }),
      content: normalizedContent,
      authors: [
        {
          _type: "reference" as const,
          _ref: createdAuthor._id,
          _key: generateKey(),
        },
      ],
      isPublished: false,
    };

    const createdArticle = await client.create(articleData);

    return c.json(
      {
        success: true,
        articleId: createdArticle._id,
        authorId: createdAuthor._id,
      },
      201
    );
  } catch (error) {
    console.error("Error creating article:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create article";
    return c.json({ error: errorMessage }, 500);
  }
});
