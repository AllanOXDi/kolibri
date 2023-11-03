<template>

  <div class="sidepanel">
    <ConfirmQuestionReplacementModal />

    <h5 :style="sectionTitle">
      {{ sectionSettings$() }}
    </h5>

    <hr
      class="horizontal-border"
      :style="horizontalBorderColor"
    >
    <h5
      class="title-style"
    >
      {{ replaceQuestions$() }}
    </h5>

    <p>{{ replaceQuestionDescription$() }}</p>
    <hr
      class="horizontal-border"
      :style="horizontalBorderColor"
    >

    <!-- reusing accordion components -->
    <button
      tabindex="-1"
      aria-expanded="false"
      aria-label="toggle-button"
      class="remove-button-style"
      :style="selectAllRow"
    >
      <div
        class="flex-div"
      >
        <div
          class="left-column-alignment-style"
        >
          <div
            class="check-box-style"
          >
            <KCheckbox />
          </div>
        </div>

        <div class="occupy-remaining-space">
          <button
            class="limit-height remove-button-style"
          >
            <KGrid>
              <KGridItem
                :layout12="{ span: 6 }"
              >
                <div class="select-all-label">
                  {{ selectAllLabel$() }}
                </div>
              </KGridItem>

              <KGridItem
                :layout12="{ span: 6 }"
              >
                <div class="sort-icon-style">
                  <div>
                    <KIcon
                      class="chevron-down-style icon-size toggle-icon"
                      icon="chevronDown"
                    />
                  </div>
                  <div>
                    <KIcon
                      class="icon-size toggle-icon"
                      icon="chevronUp"
                    />
                  </div>
                </div>
              </KGridItem>
            </KGrid>
          </button>
        </div>

      </div>
    </button>

    <AccordionContainer
      :style="accordionShadow"
    >
      <template
        #default="{ isItemExpanded, toggleItemState }"
      >
        <div
          v-for="(question,index) in quizForge.activeQuestions.value"
          :key="index"
        >
          <AccordionItem
            :id="item"
            :key="item"
            :items="question"
            :title="item"
            :expanded="isItemExpanded(question.question_id)"
          >
            <template
              :id="item"
              #heading="{ }"
              :accordionToggle="onAccordionToggle(question.question_id)"
            >
              <button
                tabindex="-1"
                aria-expanded="false"
                aria-label="toggle-button"
                class="remove-button-style"
              >
                <div
                  class="flex-div"
                >
                  <div
                    class="left-column-alignment-style"
                  >
                    <div
                      class="check-box-style"
                    >
                      <KCheckbox
                        :checked="question.selected"
                        @change="onCheckboxChange(question.question_id)"
                      />
                    </div>
                  </div>

                  <div class="occupy-remaining-space">
                    <button
                      class="limit-height remove-button-style"
                      @click="toggleItemState(question.question_id)"
                    >
                      <KGrid>
                        <KGridItem
                          :layout12="{ span: 10 }"
                        >
                          <div
                            :class="
                              isItemExpanded(question.question_id) ? 'accordion-panel-open'
                              : 'accordion-title'"
                          >
                            {{ question.title }}
                          </div>
                        </KGridItem>

                        <KGridItem
                          :layout12="{ span: 2 }"
                        >
                          <div class="right-alignment-style">
                            <KIcon
                              v-if="isItemExpanded(question.question_id)"
                              class="icon-size toggle-icon"
                              icon="chevronUp"
                            />
                            <KIcon
                              v-else
                              class="icon-size toggle-icon"
                              icon="chevronRight"
                            />
                          </div>
                        </KGridItem>
                      </KGrid>
                    </button>
                  </div>

                </div>
              </button>
            </template>

            <template
              v-if="isItemExpanded(question.question_id)"
              #content
            >
              <div
                class="accordion-panel"
                aria-labelledby="accordion1id"
              >
                <KGrid>
                  <KGridItem :layout12="{ span: 8 }">
                    <button
                      class="remove-button-style text-align-start"
                    >
                      {{ $tr('questionTitle') }}
                    </button>

                    <button
                      class="remove-button-style text-align-start text-vertical-spacing"
                    >
                      {{ $tr('shortNote') }}
                    </button>
                  </KGridItem>

                  <KGridItem
                    :layout12="{ span: 4 }"
                  >
                    <KIconButton
                      class="float-item-left-style"
                      icon="edit"
                    />
                  </KGridItem>
                </KGrid>


                <p
                  :style="{ chooseAnswerStyle , topBorder }"
                >
                  {{ chooseOneAnswerLabel$() }}
                </p>

                <div
                  v-for="(option,id) in placeholderOptions"
                  :key="id"
                >
                  <ReplaceQuizAccordion
                    :optionValue="option.answer"
                    :optionIndex="option.index"
                    :isSelected="option.selected"
                  />
                </div>
              </div>
            </template>
          </AccordionItem>
        </div>
      </template>
    </AccordionContainer>

    <footer
      class="bottom-bar-style"
    >
      <hr
        class="horizontal-border"
        :style="horizontalBorderColor"
      >

      <KGrid>
        <KGridItem
          :layout12="{ span: 6 }"
          :layout8="{ span: 4 }"
          :layout4="{ span: 2 }"
        >
          <p>{{ numberOfSelectedReplacements$({ count: selectedAnswer.length }) }}</p>
        </KGridItem>

        <KGridItem
          :layout12="{ span: 6 }"
          :layout8="{ span: 4 }"
          :layout4="{ span: 2 }"
        >
          <div
            class="float-button-right"
          >
            <KButton
              text="replace"
              :primary="true"
            />
          </div>
        </KGridItem>

      </KGrid>
    </footer>

  </div>

</template>


<script>

  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import AccordionContainer from './AccordionContainer.vue';
  import AccordionItem from './AccordionItem.vue';
  import ReplaceQuizAccordion from './ReplaceQuizAccordion.vue';
  import ConfirmQuestionReplacementModal from './ConfirmQuestionReplacementModal.vue';

  export default {
    name: 'ReplaceQuestions',
    components: {
      AccordionContainer,
      AccordionItem,
      ReplaceQuizAccordion,
      ConfirmQuestionReplacementModal,
    },
    inject: ['quizForge'],
    setup() {
      const {
        sectionSettings$,
        replaceQuestions$,
        selectAllLabel$,
        chooseOneAnswerLabel$,
        replaceQuestionDescription$,
        numberOfSelectedReplacements$,
      } = enhancedQuizManagementStrings;

      return {
        sectionSettings$,
        replaceQuestions$,
        selectAllLabel$,
        replaceQuestionDescription$,
        chooseOneAnswerLabel$,
        numberOfSelectedReplacements$,
      };
    },

    data() {
      return {
        placeholderOptions: [
          {
            index: 'A',
            answer: 'bit',
            selected: false,
          },
          {
            index: 'B',
            answer: 'bat',
            selected: false,
          },
          {
            index: 'C',
            answer: 'but',
            selected: false,
          },
          {
            index: 'D',
            answer: 'bite',
            selected: false,
          },
          {
            index: 'E',
            answer: 'bet',
            selected: false,
          },
          {
            index: 'F',
            answer: 'bait',
            selected: true,
          },
        ],
        selectedAnswer: [],
      };
    },
    computed: {
      horizontalBorderColor() {
        return `color : ${this.$themeTokens.fineLine}`;
      },
      selectAllRow() {
        return {
          backgroundColor: this.$themePalette.grey.v_50,
        };
      },
      // borderColor() {
      //   return `border-top :
      // 2px solid ${this.$themeTokens.fineLine};
      // border-bottom : 2px solid red`;
      // },

      topBorder() {
        return {
          borderTop: `1px solid ${this.$themeTokens.fineLine}`,
          borderBottom: `1px solid ${this.$themeTokens.fineLine}`,
        };
      },
      accordionShadow() {
        return {
          boxShadow: `0 0 0 0px ${this.$themeTokens.fineLine}`,
        };
      },
      sectionTitle() {
        return {
          color: this.$themePalette.grey.v_700,
        };
      },
    },
    methods: {
      onCheckboxChange(questionId) {
        if (this.selectedAnswer.includes(questionId)) {
          this.selectedAnswer = this.selectedAnswer.filter(item => item !== questionId);
        } else {
          this.selectedAnswer.push(questionId);
        }
      },
    },
    $trs: {
      shortNote: {
        message: 'Short <e>, [e]</e>',
        context: 'Short description about the section question.',
      },
      questionTitle: {
        message: 'Select the word that has the following vowel sound.',
        context: 'Question title in a particular section.',
      },
    },
  };

</script>


<style scoped>
  .sidepanel{
    margin-top:-3.0em;
  }
  .remove-button-style {
    width: 100%;
    padding: 0;
    background-color: transparent;
    border: 0;
  }
  .flex-div {
    display: flex;
  }
  .left-column-alignment-style {
    display: inline-flex;
  }
  .check-box-style {
    margin-left: 0.5em;
  }
  .occupy-remaining-space {
    flex-grow: 1;
  }
  .limit-height {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  .right-alignment-style {
    float: right;
  }
  .horizontal-border{
    margin-top:2em;
    width:100%;
  }
  .text-align-start {
    text-align: start;
  }
  .text-vertical-spacing {
    margin-top: 0.5em;
  }
  .float-item-left-style {
    float: right;
    margin-top: 1em;
  }

  .button[data-v-5aa8aec4]{
    min-width: 160px;
  }
  .float-button-right {
    float:right;
  }
  .accordion-panel-open{
    margin-top:0.2em;
    font-weight: 600;
  }
  .accordion-title{
    margin-top:0.2em;
  }
  .accordion-panel{
    margin:.5em
  }
  .sort-icon-style {
    height:0px;
    float: right;
    margin-top: -1.0em;
  }
  .side-panel-content {
    margin-top: 0;
    padding:0 0 0 0;
  }
  .bottom-bar-style{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-bottom:2em;
    padding-right:4em;
    background-color: white;
  }
  .chevron-down-style{
    margin-bottom:-1em;
  }
  .icon-size{
    font-size:1.5em;
  }
</style>
