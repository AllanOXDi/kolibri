<template>

  <KModal
    :title="yourPicturePassword$()"
    :submitText="coreString('continueAction')"
    :submitDisabled="!confirmed"
    @submit="$emit('confirm')"
  >
    <p>{{ rememberThisSequence$() }}</p>
    <ol class="picture-password-icons">
      <li
        v-for="(icon, index) in icons"
        :key="`${icon.label}-${index}`"
      >
        <figure>
          <KIcon
            class="icon"
            :icon="icon.iconName"
            :aria-label="icon.label"
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

      const { yourPicturePassword$, rememberThisSequence$, readyToContinue$ } =
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

    li {
      margin: 0;
    }

    figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0;
    }

    .icon {
      // 46px renders a raw icon of roughly 32px, matching design spec
      width: 46px;
      height: 46px;
    }

    figcaption {
      margin-top: 4px;
      font-size: 12px;
    }
  }

</style>
