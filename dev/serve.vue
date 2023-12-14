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
    <div style="display: flex">
      <avatar
        :size="80"
        name="Mohammad Dilshad Alam"
        :inline="false"
        borderColor="black"
      />
      <avatar
        name="Mohammad Dilshad Alam"
        :size="80"
        imageSrc="https://img.freepik.com/vektoren-kostenlos/geschaeftsmann-charakter-avatar-isoliert_24877-60111.jpg"
        :inline="false"
        :rounded="true"
        borderColor="black"
        status="online"
      />
      <avatar
        name="Mohammad Dilshad Alam"
        :size="80"
        imageSrc="https://marketplace.canva.com/EAFltIh8PKg/1/0/1600w/canva-cute-anime-cartoon-illustration-girl-avatar-J7nVyTlhTAE.jpg"
        :inline="false"
        :rounded="true"
        borderColor="black"
        status="away"
        :sameBorder="true"
      />
      <avatar
        name="Mohammad Dilshad Alam"
        :size="80"
        imageSrc="https://play-lh.googleusercontent.com/7Ak4Ye7wNUtheIvSKnVgGL_OIZWjGPZNV6TP_3XLxHC-sDHLSE45aDg41dFNmL5COA=w240-h480-rw"
        :inline="false"
        :rounded="true"
        borderColor="black"
        status="offline"
      />
      <avatar
        name="Mohammad Dilshad Alam"
        :size="80"
        imageSrc="https://marketplace.canva.com/EAFltIh8PKg/1/0/1600"
        :inline="false"
        :rounded="true"
        :border="false"
        status="busy"
      />
    </div>
  </div>
</template>
