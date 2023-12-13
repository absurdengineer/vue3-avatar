<script>
import { defineComponent } from "vue";
import Avatar from "@/avatar.vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    Avatar,
  },
});
</script>

<template>
  <div id="app">
    <avatar name="Mohammad Dilshad Alam" :inline="false" />
    <avatar
      name="Mohammad Dilshad Alam"
      imageSrc="https://marketplace.canva.com/EAFltIh8PKg/1/0/1600w/canva-cute-anime-cartoon-illustration-girl-avatar-J7nVyTlhTAE.jpg"
      :inline="false"
      :rounded="true"
    />
  </div>
</template>
