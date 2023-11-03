<template>

  <KModal
    :title="replaceQuestions$()"
    :submitText="coreString('confirmAction')"
    :cancelText="coreString('cancelAction')"
    :size="600"
    @cancel="cancel"
    @submit="setLang"
  >
    <p> {{ $tr('replacementWarning') }}</p>

    <p>{{ $tr('canUndo') }}</p>

  </KModal>

</template>


<script>

  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';

  export default {
    name: 'ConfirmQuestionReplacementModal',
    mixins: [commonCoreStrings],
    setup() {
      const { replaceQuestions$ } = enhancedQuizManagementStrings;

      return {
        replaceQuestions$,
      };
    },
    $trs: {
      replacementWarning: {
        message: 'The new questions you selected will replace the current ones.',
      },
      canUndo: {
        message: 'You can undo or cancel this.',
      },
    },
  };

</script>
