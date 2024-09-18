import { ref } from 'kolibri.lib.vueCompositionApi';
import { ContentNodeResource } from 'kolibri.resources';

export function useCoachMetadataTags(contentNode) {
  const tags = ref([]);

  const getCategoryTags = () => {
    if (!contentNode.categories) return [];
    return contentNode.categories.slice(0, 3);
  };

  const getLevelTags = () => {
    if (!contentNode.levels) return [];
    return contentNode.levels.slice(0, 3);
  };

  const getLanguageTag = () => {
    if (!contentNode.languages) return [];
    return contentNode.languages.length > 1 ? ['Multiple languages'] : [contentNode.languages[0]];
  };

  const getActivityTag = () => {
    if (!contentNode.activities) return [];
    return contentNode.activities.length > 1 ? ['Multiple learning activities'] : [contentNode.activities[0]];
  };

  const getDurationTag = () => {
    if (!contentNode.duration) return [];
    return [contentNode.duration];
  };

  const getSpecificCategoryTag = () => {
    if (!contentNode.categories) return [];
    const specificCategories = contentNode.categories.filter(category => category.specific);
    return specificCategories.length > 0 ? 
    [specificCategories[specificCategories.length - 1].specific] 
    : [contentNode.categories[0]];
  };

  if (contentNode.type === 'channel' || contentNode.type === 'folder') {
    tags.value = [
      ...getCategoryTags(),
      ...getLevelTags(),
      ...getLanguageTag(),
    ].slice(0, 7);
  } else if (contentNode.type === 'resource') {
    tags.value = [
      ...getActivityTag(),
      ...getDurationTag(),
      ...getLevelTags(),
      ...getSpecificCategoryTag(),
      ...getLanguageTag(),
    ].slice(0, 3);
  }

  return tags;
}
