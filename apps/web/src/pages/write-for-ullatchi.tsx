import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { Loader2, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArticleEditor,
  type PortableTextBlock,
} from "@/components/article-editor";
import { ImageCropper } from "@/components/image-cropper";
import { apiUrl } from "@/lib/api";
import type { ArticleSubmission } from "@ullatchi/types";

type WriteFormData = Omit<ArticleSubmission, "content">;

export function WriteForUllatchiPage() {
  const [content, setContent] = useState<PortableTextBlock[]>([]);
  const [profileImageBlob, setProfileImageBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WriteFormData>({
    defaultValues: {
      title: "",
      description: "",
      cardDescription: "",
      authorName: "",
      authorBio: "",
    },
  });

  const handleProfileImageCrop = (blob: Blob) => {
    setProfileImageBlob(blob);
  };

  const onSubmit = async (data: WriteFormData) => {
    // Validate content is not empty
    if (content.length === 0) {
      setSubmitError("Article content is required");
      return;
    }

    // Check if content has any actual text
    const hasContent = content.some((block) => {
      if ("children" in block && Array.isArray(block.children)) {
        return block.children.some(
          (child) => "text" in child && child.text?.trim(),
        );
      }
      return false;
    });

    if (!hasContent) {
      setSubmitError("Article content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("cardDescription", data.cardDescription || "");
      formData.append("content", JSON.stringify(content));
      formData.append("authorName", data.authorName);
      formData.append("authorBio", data.authorBio || "");

      if (profileImageBlob) {
        formData.append("profileImage", profileImageBlob, "profile.png");
      }

      const response = await fetch(apiUrl("/api/submit-article"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to submit article" }));
        throw new Error(errorData.error || "Failed to submit article");
      }

      // Success
      setIsSuccess(true);
      reset();
      setContent([]);
      setProfileImageBlob(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit article",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Article Submitted!</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Thank you for your contribution! Your article has been submitted for
            review. Our editorial team will review your submission and get back
            to you soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <Link to="/community-voices">Back to Community Voices</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setSubmitError(null);
              }}
            >
              Write Another Article
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link
          to="/community-voices"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community Voices
        </Link>

        {/* Header */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Write for Ullatchi
          </h1>
          <p className="text-muted-foreground text-lg">
            Share your perspective on local issues. Write an article and
            contribute to the conversation about governance, civic life, and
            community matters.
          </p>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Article Section */}
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                Write your article content below. Use the editor toolbar for
                formatting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your article title"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 10,
                      message: "Title must be at least 10 characters",
                    },
                    maxLength: {
                      value: 200,
                      message: "Title must be less than 200 characters",
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description / Excerpt</Label>
                <Textarea
                  id="description"
                  placeholder="A brief summary of your article (optional)"
                  rows={3}
                  {...register("description", {
                    maxLength: {
                      value: 500,
                      message: "Description must be less than 500 characters",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be shown as the article excerpt on the article page.
                </p>
              </div>

              {/* Card Description */}
              <div className="space-y-2">
                <Label htmlFor="cardDescription">Card Description</Label>
                <Textarea
                  id="cardDescription"
                  placeholder="Short description shown on article cards (optional)"
                  rows={2}
                  {...register("cardDescription", {
                    maxLength: {
                      value: 200,
                      message:
                        "Card description must be less than 200 characters",
                    },
                  })}
                />
                {errors.cardDescription && (
                  <p className="text-sm text-destructive">
                    {errors.cardDescription.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  A shorter version of the description for article cards in
                  listings.
                </p>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label>
                  Content <span className="text-destructive">*</span>
                </Label>
                <ArticleEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your article content here..."
                />
                <p className="text-xs text-muted-foreground">
                  Use the toolbar to format your content with headings, bold,
                  italic, and links.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Author Section */}
          <Card>
            <CardHeader>
              <CardTitle>Author Information</CardTitle>
              <CardDescription>
                Tell readers about yourself. This information will be displayed
                with your article.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Author Name */}
              <div className="space-y-2">
                <Label htmlFor="authorName">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="authorName"
                  placeholder="Your name or pen name"
                  {...register("authorName", {
                    required: "Display name is required",
                    minLength: {
                      value: 2,
                      message: "Display name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 100,
                      message: "Display name must be less than 100 characters",
                    },
                  })}
                />
                {errors.authorName && (
                  <p className="text-sm text-destructive">
                    {errors.authorName.message}
                  </p>
                )}
              </div>

              {/* Author Bio */}
              <div className="space-y-2">
                <Label htmlFor="authorBio">Bio</Label>
                <Textarea
                  id="authorBio"
                  placeholder="A short bio about yourself (optional)"
                  rows={3}
                  {...register("authorBio", {
                    maxLength: {
                      value: 500,
                      message: "Bio must be less than 500 characters",
                    },
                  })}
                />
                {errors.authorBio && (
                  <p className="text-sm text-destructive">
                    {errors.authorBio.message}
                  </p>
                )}
              </div>

              {/* Profile Picture */}
              <ImageCropper
                onCropComplete={handleProfileImageCrop}
                label="Profile Picture (optional)"
              />
            </CardContent>
          </Card>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              <Link to="/community-voices">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Article
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
