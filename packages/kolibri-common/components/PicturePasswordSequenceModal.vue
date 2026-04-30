<template>

  <!-- cancelDisabled prevents ESC from dismissing this modal: it is a mandatory
       gate — the learner must acknowledge their picture password before proceeding. -->
  <KModal
    :title="yourPicturePassword$()"
    :submitText="coreString('continueAction')"
    :submitDisabled="!confirmed"
    :cancelDisabled="true"
    @submit="$emit('confirm')"
  >
    <p>{{ rememberThisSequence$() }}</p>
    <ol class="picture-password-icons">
      <li
        v-for="(icon, index) in icons"
        :key="index"
      >
        <figure>
          <KIcon
            class="icon"
            :icon="icon.iconName"
            :aria-label="showIconText ? undefined : icon.label"
            :aria-hidden="showIconText ? true : undefined"
          />
          <figcaption
            v-if="showIconText"
            :style="{ color: $themeTokens.annotation }"
          >
            {{ icon.label }}
          </figcaption>
        </figure>
      </li>
    </ol>
    <p>{{ coachCanHelp$() }}</p>
    <KCheckbox
      v-model="confirmed"
      :label="readyToContinue$()"
    />
  </KModal>

</template>


<script>

  import { ref, computed } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { getPicturePasswordIcons } from 'kolibri-common/utils/picturePassword';
  import { picturePasswordStrings } from 'kolibri-common/strings/picturePasswords';

  export default {
    name: 'PicturePasswordSequenceModal',
    mixins: [commonCoreStrings],
    setup(props) {
      const confirmed = ref(false);

      const { yourPicturePassword$, rememberThisSequence$, coachCanHelp$, readyToContinue$ } =
        picturePasswordStrings;

      const icons = computed(() =>
        getPicturePasswordIcons(props.picturePassword, props.picturePasswordSettings?.icon_style),
      );

      const showIconText = computed(() => props.picturePasswordSettings?.show_icon_text ?? true);

      return {
        confirmed,
        icons,
        showIconText,
        yourPicturePassword$,
        rememberThisSequence$,
        coachCanHelp$,
        readyToContinue$,
      };
    },
    props: {
      picturePassword: {
        type: String,
        required: true,
      },
      picturePasswordSettings: {
        type: Object,
        default: null,
      },
    },
    emits: ['confirm'],
  };

</script>


<style lang="scss" scoped>

  .picture-password-icons {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 0;
    margin: 16px 0;
    list-style: none;
  }

  .picture-password-icons li {
    margin: 0;
  }

  .picture-password-icons figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
  }

  .picture-password-icons .icon {
    // 46px renders a raw icon of roughly 32px, matching design spec
    width: 46px;
    height: 46px;
  }

  .picture-password-icons figcaption {
    margin-top: 4px;
    font-size: 12px;
  }

</style>
