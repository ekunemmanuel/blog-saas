<template>
  <editor-content :editor="editor" />
</template>

<script setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
// import Highlight from "@tiptap/extension-highlight";
// import TextAlign from "@tiptap/extension-text-align";
// import { Color } from "@tiptap/extension-color";
// import ListItem from "@tiptap/extension-list-item";
// import TextStyle from "@tiptap/extension-text-style";

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
    // Highlight,
    // TextAlign,
    // Color.configure({ types: [TextStyle.name, ListItem.name] }),
    // TextStyle.configure({ types: [ListItem.name] }),
  ],
  editable: false,
  enableCoreExtensions: true,
  parse: {},
  editorProps: {
    attributes: {
      class:
        " dark:prose-invert max-w-full focus:outline-none  break-before-all prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl        ",
    },
  },
  onUpdate: () => {
    content.value = JSON.stringify(editor.value.getJSON());
  },
});
onBeforeUnmount(() => {
  editor.value.destroy();
});
</script>

<style></style>
