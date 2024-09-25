import { ref } from 'kolibri.lib.vueCompositionApi';
import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
import coreStrings from 'kolibri.utils.coreStrings';


export function useCoachMetadataTags(_contentNode) {
  const tags = ref([]);
  
  const getCategoryTags = () => {
    if (!_contentNode.categories) return [];
    const slicedArray =  _contentNode.categories.slice(0, 3);
    return slicedArray.map(category => coreStrings.$tr(category.label));
  };

  const getLevelTags = () => {
    if (!_contentNode.grade_levels) return [];
    return _contentNode.grade_levels.slice(0, 3).map(level => coreStrings.$tr(level.label));
  };

  const getLanguageTag = () => {
      if (!_contentNode.lang) return [];
      return _contentNode.lang.length > 1 ? ['Multiple languages'] : [_contentNode.lang.lang_name];
    };

  const getActivityTag = () => {
    if (!_contentNode.learning_activities) return [];
    return _contentNode.learning_activities.length > 1 ? ['Multiple learning activities'] : [_contentNode.learning_activities[0]];
    };

  const getDurationTag = () => {
    if (!_contentNode.duration) return [];
    return [_contentNode.duration];
    };

  const getSpecificCategoryTag = () => {
    if (!_contentNode.categories) return [];
    const specificCategories = _contentNode.categories.filter(category => category.specific);
    return specificCategories.length > 0 ? 
    [specificCategories[specificCategories.length - 1].specific] 
    : [_contentNode.categories[0]];
    };

  if (_contentNode.kind === ContentNodeKinds.CHANNEL ||
     _contentNode.kind === ContentNodeKinds.TOPIC) {
    tags.value = [
      ...getCategoryTags(),
      ...getLevelTags(),
      ...getLanguageTag(),
    ].slice(0, 7);
  } else {
    tags.value = [
      ...getActivityTag(),
      ...getDurationTag(),
      ...getLevelTags(),
      ...getSpecificCategoryTag(),
      ...getLanguageTag(),
    ].slice(0, 3);
  }


  return {
    tags,
    getActivityTag,
    getLevelTags,
    getCategoryTags,
    getLanguageTag,
    getSpecificCategoryTag,
  };
}
