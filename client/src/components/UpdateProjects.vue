<template>
  <div>
    <div>
      <h6>Update your project!</h6>
    </div>
    <div class="form">
      <div class="form-group">
        <label>Project Name</label>
        <span class="star">*</span>

        <input type="Project-Name" v-model="name" class="form-control active" />
      </div>
      <div class="form-group">
        <label>Description</label>
        <span class="star">*</span>

        <textarea
          type="Description"
          v-model="description"
          class="form-control active description"
          placeholder="This project is.."
          rows="4"
          cols="50"
          maxlength="230"
          name="comment"
        />
        <small id="bio-type" class="form-text text-muted"
          >Describe your project!</small
        >
      </div>

      <div class="form group">
        <b-form-group label="select your tags:">          
          <b-form-tags
            v-model="value"
            size="sm"
            add-on-change
            no-outer-focus
            class="mb-2 outer"
          >
            <template
              v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }"
            >
              <ul v-if="tags.length > 0" class="list-inline">
                <li v-for="tag in tags" :key="tag" class="abc">
                  <b-form-tag
                    @remove="removeTag(tag)"
                    :title="tag"
                    :disabled="disabled"
                    variant="info"
                    >{{ tag }}</b-form-tag
                  >
                </li>
              </ul>
              <b-form-select
                class="form-control abc"
                v-bind="inputAttrs"
                v-on="inputHandlers"
                :disabled="disabled || availableOptions.length === 0"
                :options="availableOptions"
              >
                <template v-slot:first>
                  <option disabled value="">Choose a tag...</option>
                </template>
              </b-form-select>
            </template>
          </b-form-tags>
        </b-form-group>
      </div>

      <div>
        <label>Collaborators:</label>
        <b-form-tags
          input-id="tags-separators"
          v-model="value2"
          separator=" ,;"
          placeholder="Enter collaborator utorid's seperated by commas"
          no-add-on-enter
          remove-on-delete
          class="mb-2"
          :tag-validator="utoridValidator"
          invalid-tag-text="Invalid utorid(s)"
          duplicate-tag-text="Duplicate utorid(s)"
        ></b-form-tags>
      </div>

      <div class="form-group">
        <label>Website</label>

        <input
          type="website"
          v-model="website"
          class="form-control active"
          placeholder="https://myProjectRepo.ca"
        />
        <small id="website-type" class="form-text text-muted"
          >Link your repo!</small
        >
      </div>

      <div class="form-group">
        <label>Project Picture </label>
        <br />
        <input
          type="file"
          id="file"
          ref="file"
          v-on:change="handleFileUpload()"
        />
      </div>

      <div id="button">
        <p class="star">{{ error }}</p>
        <button
          type="log-in-via-utorid"
          class="btn btn-primary"
          @click="updateProject"
        >
          PUBLISH
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "updateProject",
  data() {
    return {
      name: "",
      description: "",
      website: "",
      options: [],
      value: [],
      value2:[],
      collab: [],
      file: "",
      error: ""
    };
  },
  async mounted() {
    await axios.get("/connect/tags").then(response => {
      for (var i = 0; i < response.data.length; i++) {
        this.options.push(response.data[i].tag_name);
      }
    });

    axios.get("/connect/get_utorids").then(response => {
        for (var j = 0; j < response.data.length; j ++) {
            this.collab.push(response.data[j].utorid)
        }
    })

    this.id = this.$route.params.id;
    axios.get("/connect/getproject?id=" + this.id).then(response => {
      this.name = response.data.project_name;
      this.description = response.data.desc;
      this.website = response.data.website || "";
      for (var i = 0; i < response.data.Tags.length; i++) {
        this.value.push(response.data.Tags[i].tag_name);
      }
      for (var j = 0; j < response.data.Users.length; j++) {
        this.value2.push(response.data.Users[j].utorid);
      }
    });
  },
  computed: {
    availableOptions() {
      return this.options.filter(opt => this.value.indexOf(opt) === -1);
    }
  },
  methods: {
    utoridValidator(tag) {
      return  this.collab.includes(tag)
    },
    updateProject() {
      if(this.name == ''){
        this.error = "Please enter a project name"
        return
      }else if(this.description == ''){
        this.error = "Please enter a project description"
        return
      }
      else if(this.value.length == 0){
        this.error = "Please select at least one tag"
        return
      }
      if (this.value2.indexOf(this.$store.state.user.utorid) == -1){
        this.value2.push(this.$store.state.user.utorid);
      }
      
      var form = new FormData();
      form.append("picture", this.file);
      form.append("id", this.$route.params.id);
      form.append("desc", this.description);
      form.append("project_name", this.name);
      form.append("tags", JSON.stringify(this.value));
      form.append("website", this.website);
      form.append("collab", JSON.stringify(this.value2));
      axios
        .post("/connect/update-projects", form, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        .then(response => {
          this.id = response.data.id;
          this.projectname = response.data.project_name;
          this.desc = response.data.desc;
          this.website = response.data.website;
          const userId = this.$store.state.user.id;
          this.$router.push({ path: `/profile/${userId}` });
        })
        .catch(() => {
          this.error = "Something went wrong, please try again shortly.";
        });
    },
    handleFileUpload() {
      this.error = "";
      var file = this.$refs.file.files[0];
      var size = file.size / 1024 / 1024; // in MB
      if (size > 2) {
        this.error = "Please select a file under 2MB";
      } else if (file.type != "image/jpeg" && file.type != "image/png") {
        this.error = "Please select a png or jpg image";
      } else {
        this.file = file;
      }
    }
  }
};
</script>

<style scoped>
body {
  padding-top: 40px;
  background-color: white;
  color: black;
  text-align: center;
}
body h1 {
  font-weight: bolder;
  font-size: 60px;
  text-align: center;
}
body h6 {
  font-weight: bold;
  font-size: 20px;
  padding-top: 10px;
}
.form {
  display: inline-block;
}
.form-group {
  text-align: left;
}
.form-control {
  width: 500px;
  border-color: black;
}
.active {
  color: black;
}
#bio-type {
  width: 500px;
}
#button {
  padding-bottom: 20px;
  padding-top: 20px;
}
.btn {
  background-color: #2e2e2e;
}
.btn-primary {
  border-color: white;
  background-color: #2e2e2e;
}
.btn:hover {
  background-color: white;
  color: black;
  border-color: black;
}
.star {
  color: red;
}

.abc {
  display: inline;
}

.abc:not(:first-child) {
  padding-left: 10px;
}

.outer {
  border-color: white;
  padding: 0;
}

.outer span {
  background-color: lightslategrey;
  border-color: black;
  color: white;
}
</style>
