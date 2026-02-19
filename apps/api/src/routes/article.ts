import { Elysia, t } from "elysia";
import { articleSubmissionSchema } from "@ullatchi/types";
import { getSanityClient } from "../lib/sanity";
import { generateSlug, generateKey } from "../lib/utils";

function isValidPortableTextContent(
  content: unknown,
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
  content: Array<{ _type: string; _key?: string; [key: string]: unknown }>,
): Array<{ _type: string; _key: string; [key: string]: unknown }> {
  return content.map((block) => {
    const normalizedBlock = { ...block, _key: block._key || generateKey() };

    if ("children" in normalizedBlock && Array.isArray(normalizedBlock.children)) {
      normalizedBlock.children = normalizedBlock.children.map(
        (child: { _key?: string; [key: string]: unknown }) => ({
          ...child,
          _key: child._key || generateKey(),
        }),
      );
    }

    if ("markDefs" in normalizedBlock && Array.isArray(normalizedBlock.markDefs)) {
      normalizedBlock.markDefs = normalizedBlock.markDefs.map(
        (def: { _key?: string; [key: string]: unknown }) => ({
          ...def,
          _key: def._key || generateKey(),
        }),
      );
    }

    return normalizedBlock;
  });
}

export const articleRoutes = new Elysia({ prefix: "/api" }).post(
  "/submit-article",
  async ({ body, set }) => {
    try {
      const result = articleSubmissionSchema.safeParse(body);
      if (!result.success) {
        set.status = 400;
        return { error: result.error.issues[0].message };
      }
      const { title, description, cardDescription, content: rawContent, authorName, authorBio } = result.data;

      let content: unknown;
      try {
        content = JSON.parse(rawContent);
      } catch {
        set.status = 400;
        return { error: "Invalid content format" };
      }

      if (!isValidPortableTextContent(content)) {
        set.status = 400;
        return { error: "Invalid content structure" };
      }

      const normalizedContent = normalizePortableTextContent(content);

      const profileImageFile = body.profileImage;

      if (profileImageFile && profileImageFile.size > 0) {
        const maxSize = 10 * 1024 * 1024;
        if (profileImageFile.size > maxSize) {
          set.status = 400;
          return { error: "Profile image must be less than 10MB" };
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(profileImageFile.type)) {
          set.status = 400;
          return {
            error: "Profile image must be a valid image format (JPEG, PNG, GIF, or WebP)",
          };
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

      set.status = 201;
      return {
        success: true,
        articleId: createdArticle._id,
        authorId: createdAuthor._id,
      };
    } catch (error) {
      console.error("Error creating article:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create article";
      set.status = 500;
      return { error: errorMessage };
    }
  },
  {
    body: t.Object({
      title: t.String(),
      description: t.Optional(t.String()),
      cardDescription: t.Optional(t.String()),
      content: t.String(),
      authorName: t.String(),
      authorBio: t.Optional(t.String()),
      profileImage: t.Optional(t.File()),
    }),
  },
);
