<script setup lang="ts">
const items = [
  { alt: "Dashboard", src: "/dashboard.png" },
  { alt: "Sites", src: "/sites.png" },
  { alt: "Posts", src: "/posts.png" },
  { alt: "Site Blogs", src: "/blogs.png" },
  { alt: "Blog Page", src: "/post.png" },
];

const smallItems = [
  { alt: "Dashboard Small", src: "/sm-dashboard.png" },
  { alt: "Sites Small", src: "/sm-sites.png" },
  { alt: "Posts Small", src: "/sm-posts.png" },
  { alt: "Site Blogs Small", src: "/sm-blogs.png" },
  { alt: "Blog Page Small", src: "/sm-blog.png" },
];

const carouselRef = ref();

onMounted(() => {
  setInterval(() => {
    if (!carouselRef.value) return;

    if (carouselRef.value.page === carouselRef.value.pages) {
      return carouselRef.value.select(0);
    }

    carouselRef.value.next();
  }, 5000);
});
</script>

<template>
  <div>
    <UCarousel
      ref="carouselRef"
      v-slot="{ item }"
      :items="smallItems"
      :ui="{ item: 'basis-full h-[700px]' }"
      class="rounded-lg overflow-hidden w-full block sm:hidden"
      indicators
    >
      <NuxtImg
        :src="item.src"
        :alt="item.alt"
        class="w-full object-cover object-top"
        draggable="false"
        format="webp"
      />
    </UCarousel>

    <!-- Large screen -->
    <UCarousel
      ref="carouselRef"
      v-slot="{ item }"
      :items="items"
      :ui="{ item: 'basis-full' }"
      class="rounded-lg overflow-hidden w-full hidden sm:block"
      indicators
    >
      <NuxtImg
        :src="item.src"
        :alt="item.alt"
        class="w-full"
        draggable="false"
        format="webp"
      />
    </UCarousel>
  </div>
</template>
