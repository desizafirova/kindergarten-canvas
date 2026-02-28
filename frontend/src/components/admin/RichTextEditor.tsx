import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import DOMPurify from 'dompurify';
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  error?: boolean;
  placeholder?: string;
  id?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  error = false,
  placeholder = 'Започнете да пишете...',
  id,
}) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading, use custom
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Heading.configure({
        levels: [2, 3],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('🔍 Editor HTML:', html);
      // Sanitize HTML to prevent XSS attacks before storing in database
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'h2', 'h3'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      });
      console.log('🧼 Sanitized HTML:', sanitizedHtml);
      onChange(sanitizedHtml);
    },
    immediatelyRender: false, // Best practice for SSR apps (2026)
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4',
          error && 'border-destructive'
        ),
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleHeading2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleHeading3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();

  const openLinkDialog = () => {
    // Pre-fill with existing link if selected text is a link
    const existingUrl = editor.getAttributes('link').href || '';
    setLinkUrl(existingUrl);
    setIsLinkDialogOpen(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  };

  const handleLinkDialogClose = () => {
    setIsLinkDialogOpen(false);
    setLinkUrl('');
    editor.chain().focus().run();
  };

  const toolbarButtons = [
    {
      icon: Bold,
      onClick: toggleBold,
      isActive: editor.isActive('bold'),
      label: 'Удебелен (Ctrl+B)',
      ariaLabel: 'Удебелен текст',
    },
    {
      icon: Italic,
      onClick: toggleItalic,
      isActive: editor.isActive('italic'),
      label: 'Курсив (Ctrl+I)',
      ariaLabel: 'Курсив текст',
    },
    {
      icon: UnderlineIcon,
      onClick: toggleUnderline,
      isActive: editor.isActive('underline'),
      label: 'Подчертан (Ctrl+U)',
      ariaLabel: 'Подчертан текст',
    },
    {
      icon: List,
      onClick: toggleBulletList,
      isActive: editor.isActive('bulletList'),
      label: 'Списък с точки',
      ariaLabel: 'Списък с точки',
    },
    {
      icon: ListOrdered,
      onClick: toggleOrderedList,
      isActive: editor.isActive('orderedList'),
      label: 'Номериран списък',
      ariaLabel: 'Номериран списък',
    },
    {
      icon: Heading2,
      onClick: toggleHeading2,
      isActive: editor.isActive('heading', { level: 2 }),
      label: 'Заглавие 2',
      ariaLabel: 'Заглавие ниво 2',
    },
    {
      icon: Heading3,
      onClick: toggleHeading3,
      isActive: editor.isActive('heading', { level: 3 }),
      label: 'Заглавие 3',
      ariaLabel: 'Заглавие ниво 3',
    },
    {
      icon: LinkIcon,
      onClick: openLinkDialog,
      isActive: editor.isActive('link'),
      label: 'Вмъкни връзка',
      ariaLabel: 'Вмъкни хипервръзка',
    },
  ];

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLinkSubmit();
    }
  };

  return (
    <div
      id={id}
      className={cn(
        'border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        error && 'border-destructive focus-within:ring-destructive'
      )}
      role="textbox"
      aria-labelledby={id ? `${id}-label` : undefined}
      aria-multiline="true"
    >
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1" role="toolbar" aria-label="Инструменти за форматиране">
        {toolbarButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <Button
              key={index}
              type="button"
              variant={button.isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={button.onClick}
              className={cn('h-8 w-8 p-0', button.isActive && 'bg-primary/90')}
              title={button.label}
              aria-label={button.ariaLabel}
              aria-pressed={button.isActive}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor Content */}
      <div className="bg-background">
        <EditorContent
          editor={editor}
          className={cn('min-h-[200px]', error && 'border-destructive')}
          placeholder={placeholder}
        />
      </div>

      {/* Link Dialog - Accessible replacement for window.prompt */}
      <Dialog open={isLinkDialogOpen} onOpenChange={handleLinkDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Вмъкни връзка</DialogTitle>
            <DialogDescription>
              Въведете URL адреса на връзката. Оставете празно за да премахнете връзката.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="link-url" className="sr-only">
              URL адрес
            </Label>
            <Input
              id="link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="https://example.com"
              type="url"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLinkDialogClose}>
              Отказ
            </Button>
            <Button onClick={handleLinkSubmit}>
              {linkUrl ? 'Добави връзка' : 'Премахни връзка'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
