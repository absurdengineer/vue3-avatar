<script>
import Avatar from "@/components/Avatar.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    Avatar,
  },
});
</script>

<template>
  <div id="app">
    <div style="display: flex; gap: 10px">
      <avatar
        :size="80"
        name="Mohammad Dilshad Alam"
        :inline="false"
        borderColor="black"
      />
      <avatar
        :size="80"
        name="Mohammad Dilshad Alam"
        :inline="false"
        borderColor="black"
        :useLegacyColors="true"
      />
     <div style="display: inline-block;">
      <avatar
        name="Mohammad Dilshad Alam"
        :size="80"
        imageSrc="https://img.freepik.com/vektoren-kostenlos/geschaeftsmann-charakter-avatar-isoliert_24877-60111.jpg"
        :inline="false"
        :rounded="true"
        borderColor="black"
        status="online"
      />
     </div>
     <div style="display: inline-block;">
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
    </div>
      <div style="display: inline-block;">
        <avatar
          name="Mohammad Dilshad Alam"
          :size="80"
          imageSrc="https://play-lh.googleusercontent.com/7Ak4Ye7wNUtheIvSKnVgGL_OIZWjGPZNV6TP_3XLxHC-sDHLSE45aDg41dFNmL5COA=w240-h480-rw"
          :inline="false"
          :rounded="true"
          borderColor="black"
          status="offline"
        />
      </div>
      <div style="display: inline-block;">
        <avatar
        name="Mohammad Dilshad Alam"
        :size="80"
        imageSrc="https://imgs.search.brave.com/gkEV9yc54nx5w6v5dsRZjDvLxcWR_Q3vhrrXkz_DnXE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS12ZWN0/b3IvYm95LXdpdGgt/aG9vZGllLXRoYXQt/c2F5cy1oZXMtYm95/Xzk2OTg2My0yMDY4/MDMuanBnP3NpemU9/NjI2JmV4dD1qcGc"
        :inline="false"
        :rounded="true"
        borderColor="black"
        status="busy"
        :customAvatarStyle="{
          height: '150px',
          width:  '150px'
        }"
        :customStatusStyle="{
          height: '60px',
          width: '60px',
        }"
      />
      </div>
      <div style="display: inline-block;">
      <avatar
        name="Mohammad Dilshad Alam"
        imageSrc="https://marketplace.canva.com/EAFltIh8PKg/1/0/1600"
        :inline="false"
        :rounded="true"
        :border="false"
        status="busy"
        :customAvatarStyle="{height: '150px', width: '150px', fontSize: '50px'}"
        :customStatusStyle="{backgroundColor: 'purple', height: '30px', width: '50px'}"
      />
    </div>
    </div>
  </div>
</template>
