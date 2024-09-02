<template>
  <UContainer
    v-if="editor"
    class="space-y-4 min-h-[700px] rounded-lg border p2-8   flex flex-col relative"
  >
    <div class=" sticky top-0 dark:bg-[#171717] bg-white z-10 pt-8">
      <div
        class="gap-2 flex-wrap grid grid-cols-[repeat(auto-fit,minmax(min(100px,100%),1fr))]"
      >
        <UButton
          v-for="(button, index) in buttons"
          :key="index"
          @click="button.action"
          :disabled="button.isDisabled ? button.isDisabled() : false"
          :color="
            button.isActive ? (button.isActive() ? 'primary' : 'gray') : 'gray'
          "
          class=""
        >
          <div>
            {{ button.label }}
          </div>
        </UButton>
      </div>
    </div>
    <editor-content :editor="editor" class="grid flex-1" />
  </UContainer>
  <UContainer
    v-else
    class="space-y-4 min-h-[700px] rounded-lg border p-8 flex justify-center items-center flex-col"
  >
    <UButton variant="ghost" disabled loading> Loading editor .. </UButton>
  </UContainer>
</template>

<script setup>
import {
  useEditor,
  BubbleMenu,
  EditorContent,
  FloatingMenu,
} from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";

const content = defineModel({
  default: undefined,
});

const editor = useEditor({
  content: content.value
    ? JSON.parse(content.value)
    : {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "What is on your mind?",
              },
            ],
          },
        ],
      },
  extensions: [
    StarterKit,
    Highlight,
    TextAlign,
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
  ],
  enableCoreExtensions: true,
  parse: {},
  editorProps: {
    attributes: {
      class:
        " dark:prose-invert  max-w-full focus:outline-none  p-2 break-before-all prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl        ",
    },
  },
  onUpdate: () => {
    content.value = JSON.stringify(editor.value.getJSON());
  },
});
onBeforeUnmount(() => {
  editor.value.destroy();
});

const buttons = [
  {
    label: "Bold",
    action: () => editor.value.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive("bold"),
    isDisabled: () => !editor.value.can().chain().focus().toggleBold().run(),
  },
  {
    label: "Italic",
    action: () => editor.value.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive("italic"),
    isDisabled: () => !editor.value.can().chain().focus().toggleItalic().run(),
  },
  {
    label: "Strike",
    action: () => editor.value.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive("strike"),
    isDisabled: () => !editor.value.can().chain().focus().toggleStrike().run(),
  },
  {
    label: "Code",
    action: () => editor.value.chain().focus().toggleCode().run(),
    isActive: () => editor.value?.isActive("code"),
    isDisabled: () => !editor.value.can().chain().focus().toggleCode().run(),
  },
  {
    label: "Clear marks",
    action: () => editor.value.chain().focus().unsetAllMarks().run(),
  },
  {
    label: "Clear nodes",
    action: () => editor.value.chain().focus().clearNodes().run(),
  },
  {
    label: "Paragraph",
    action: () => editor.value.chain().focus().setParagraph().run(),
    isActive: () => editor.value?.isActive("paragraph"),
  },
  {
    label: "H1",
    action: () =>
      editor.value.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 1 }),
  },
  {
    label: "H2",
    action: () =>
      editor.value.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 2 }),
  },
  {
    label: "H3",
    action: () =>
      editor.value.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 3 }),
  },
  {
    label: "H4",
    action: () =>
      editor.value.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 4 }),
  },
  {
    label: "H5",
    action: () =>
      editor.value.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 5 }),
  },
  {
    label: "H6",
    action: () =>
      editor.value.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 6 }),
  },
  {
    label: "Bullet list",
    action: () => editor.value.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive("bulletList"),
  },
  {
    label: "Ordered list",
    action: () => editor.value.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive("orderedList"),
  },
  {
    label: "Code block",
    action: () => editor.value.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.value?.isActive("codeBlock"),
  },
  {
    label: "Blockquote",
    action: () => editor.value.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive("blockquote"),
  },
  {
    label: "Horizontal rule",
    action: () => editor.value.chain().focus().setHorizontalRule().run(),
  },
  {
    label: "Hard break",
    action: () => editor.value.chain().focus().setHardBreak().run(),
  },
  {
    label: "Undo",
    action: () => editor.value.chain().focus().undo().run(),
    isDisabled: () => !editor.value.can().chain().focus().undo().run(),
  },
  {
    label: "Redo",
    action: () => editor.value.chain().focus().redo().run(),
    isDisabled: () => !editor.value.can().chain().focus().redo().run(),
  },
  {
    label: "Purple",
    action: () => editor.value.chain().focus().setColor("#958DF1").run(),
    isActive: () => editor.value?.isActive("textStyle", { color: "#958DF1" }),
  },
];
</script>

<style></style>
