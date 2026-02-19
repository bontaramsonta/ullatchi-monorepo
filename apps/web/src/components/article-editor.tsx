import { useCallback, useState, useEffect, useRef } from "react";
import {
  defineSchema,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  type PortableTextBlock,
} from "@portabletext/editor";
import * as selectors from "@portabletext/editor/selectors";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Link as LinkIcon,
  Pilcrow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define schema matching article.ts content field
const schemaDefinition = defineSchema({
  decorators: [{ name: "strong" }, { name: "em" }, { name: "underline" }],
  styles: [
    { name: "normal" },
    { name: "h2" },
    { name: "h3" },
    { name: "h4" },
    { name: "blockquote" },
  ],
  annotations: [
    {
      name: "link",
    },
  ],
  lists: [{ name: "bullet" }, { name: "number" }],
  inlineObjects: [],
  blockObjects: [],
});

interface ArticleEditorProps {
  value: PortableTextBlock[];
  onChange: (value: PortableTextBlock[]) => void;
  placeholder?: string;
}

// Decorator button component
function DecoratorButton({
  decorator,
  icon: Icon,
  title,
}: {
  decorator: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  const editor = useEditor();
  const isActive = useEditorSelector(
    editor,
    selectors.isActiveDecorator(decorator),
  );

  const handleClick = useCallback(() => {
    editor.send({ type: "decorator.toggle", decorator });
    editor.send({ type: "focus" });
  }, [editor, decorator]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-accent text-accent-foreground",
      )}
      onClick={handleClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

// Style button component
function StyleButton({
  style,
  icon: Icon,
  title,
}: {
  style: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  const editor = useEditor();
  const isActive = useEditorSelector(editor, selectors.isActiveStyle(style));

  const handleClick = useCallback(() => {
    editor.send({ type: "style.toggle", style });
    editor.send({ type: "focus" });
  }, [editor, style]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-accent text-accent-foreground",
      )}
      onClick={handleClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

// Link button with dialog for URL input
function LinkButton() {
  const editor = useEditor();
  const hasLink = useEditorSelector(
    editor,
    selectors.isActiveAnnotation("link"),
  );
  const isExpanded = useEditorSelector(editor, selectors.isSelectionExpanded);
  const [isOpen, setIsOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
    setLinkUrl("");
  }, []);

  const handleAddLink = useCallback(() => {
    if (!linkUrl.trim()) return;

    editor.send({
      type: "annotation.add",
      annotation: {
        name: "link",
        value: { href: linkUrl.trim() },
      },
    });
    setLinkUrl("");
    setIsOpen(false);
    editor.send({ type: "focus" });
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    editor.send({
      type: "annotation.remove",
      annotation: { name: "link" },
    });
    editor.send({ type: "focus" });
  }, [editor]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          hasLink && "bg-accent text-accent-foreground",
        )}
        onClick={hasLink ? handleRemoveLink : handleOpenDialog}
        title={hasLink ? "Remove link" : "Add link"}
        disabled={!isExpanded && !hasLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL for the selected text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddLink}
              disabled={!linkUrl.trim()}
            >
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Toolbar component
function Toolbar() {
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
      {/* Styles */}
      <StyleButton style="normal" icon={Pilcrow} title="Normal text" />
      <StyleButton style="h2" icon={Heading2} title="Heading 2" />
      <StyleButton style="h3" icon={Heading3} title="Heading 3" />
      <StyleButton style="h4" icon={Heading4} title="Heading 4" />
      <StyleButton style="blockquote" icon={Quote} title="Quote" />

      <div className="w-px h-6 bg-border mx-1" />

      {/* Decorators */}
      <DecoratorButton decorator="strong" icon={Bold} title="Bold" />
      <DecoratorButton decorator="em" icon={Italic} title="Italic" />
      <DecoratorButton
        decorator="underline"
        icon={Underline}
        title="Underline"
      />

      <div className="w-px h-6 bg-border mx-1" />

      {/* Link */}
      <LinkButton />
    </div>
  );
}

// Editor content component - renders the editable area with styles
function EditorContent({ placeholder }: { placeholder?: string }) {
  const renderStyle = useCallback(
    (props: { children: React.ReactElement; value: string }) => {
      const { value, children } = props;
      switch (value) {
        case "h2":
          return <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>;
        case "h3":
          return (
            <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>
          );
        case "h4":
          return <h4 className="text-lg font-medium mt-4 mb-2">{children}</h4>;
        case "blockquote":
          return (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          );
        default:
          return <>{children}</>;
      }
    },
    [],
  );

  const renderDecorator = useCallback(
    (props: { children: React.ReactElement; value: string }) => {
      const { value, children } = props;
      switch (value) {
        case "strong":
          return <strong className="font-bold">{children}</strong>;
        case "em":
          return <em className="italic">{children}</em>;
        case "underline":
          return <u className="underline">{children}</u>;
        default:
          return <>{children}</>;
      }
    },
    [],
  );

  const renderAnnotation = useCallback(
    (props: {
      children: React.ReactElement;
      value: { _type: string; href?: string };
    }) => {
      const { value, children } = props;
      if (value._type === "link") {
        return (
          <span
            className="text-primary underline cursor-pointer"
            title={value.href}
          >
            {children}
          </span>
        );
      }
      return <>{children}</>;
    },
    [],
  );

  const renderPlaceholder = useCallback(
    () => (
      <span className="pl-4 text-muted-foreground pointer-events-none">
        {placeholder || "Start writing your article..."}
      </span>
    ),
    [placeholder],
  );

  return (
    <PortableTextEditable
      className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
      renderStyle={renderStyle}
      renderDecorator={renderDecorator}
      renderAnnotation={renderAnnotation}
      renderListItem={(props) => <>{props.children}</>}
      renderPlaceholder={renderPlaceholder}
    />
  );
}

// Value change listener component
function ValueChangeListener({
  onChange,
}: {
  onChange: (value: PortableTextBlock[]) => void;
}) {
  const editor = useEditor();
  const value = useEditorSelector(editor, selectors.getValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current(value);
  }, [value]);

  return null;
}

export function ArticleEditor({
  value,
  onChange,
  placeholder,
}: ArticleEditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorProvider
        initialConfig={{
          schemaDefinition,
          initialValue: value,
        }}
      >
        <ValueChangeListener onChange={onChange} />
        <Toolbar />
        <EditorContent placeholder={placeholder} />
      </EditorProvider>
    </div>
  );
}

export type { PortableTextBlock };
