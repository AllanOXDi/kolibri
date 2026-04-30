import { render, screen, fireEvent } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
import { picturePasswordStrings } from 'kolibri-common/strings/picturePasswords';
import PicturePasswordSequenceModal from '../PicturePasswordSequenceModal.vue';

const { continueAction$ } = coreStrings;
const { yourPicturePassword$, readyToContinue$, rememberThisSequence$, coachCanHelp$ } =
  picturePasswordStrings;

jest.mock('kolibri-common/utils/picturePassword', () => ({
  getPicturePasswordIcons: jest.fn(() => [
    { iconName: 'moonColorful', label: 'moon' },
    { iconName: 'starColorful', label: 'star' },
    { iconName: 'treeColorful', label: 'tree' },
  ]),
}));

const defaultProps = {
  picturePassword: '1.2.3',
  picturePasswordSettings: { icon_style: 'colorful', show_icon_text: true },
};

function renderModal(props = {}) {
  return render(PicturePasswordSequenceModal, { props: { ...defaultProps, ...props } });
}

describe('PicturePasswordSequenceModal', () => {
  it('renders with the correct title and instructions', () => {
    renderModal();
    expect(screen.getByText(yourPicturePassword$())).toBeInTheDocument();
    expect(screen.getByText(rememberThisSequence$())).toBeInTheDocument();
    expect(screen.getByText(coachCanHelp$())).toBeInTheDocument();
  });

  it('submit button is disabled initially', () => {
    renderModal();
    expect(screen.getByRole('button', { name: continueAction$() })).toBeDisabled();
  });

  it('submit button is enabled after checking the checkbox', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('checkbox', { name: readyToContinue$() }));
    expect(screen.getByRole('button', { name: continueAction$() })).toBeEnabled();
  });

  it('emits confirm when submit is clicked after checking the checkbox', async () => {
    const user = userEvent.setup();
    const { emitted } = renderModal();
    await user.click(screen.getByRole('checkbox', { name: readyToContinue$() }));
    await user.click(screen.getByRole('button', { name: continueAction$() }));
    expect(emitted().confirm).toHaveLength(1);
  });

  it('does not emit confirm when submit is clicked without checking the checkbox', async () => {
    // KModal's disabled submit has pointer-events:none, so userEvent throws;
    // fireEvent is needed here to dispatch the click directly.
    const { emitted } = renderModal();
    await fireEvent.click(screen.getByRole('button', { name: continueAction$() }));
    expect(emitted().confirm).toBeFalsy();
  });

  it('pressing ESC keeps the modal open', async () => {
    const user = userEvent.setup();
    renderModal();
    expect(screen.getByText(yourPicturePassword$())).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByText(yourPicturePassword$())).toBeInTheDocument();
  });

  it('shows icon labels when show_icon_text is true', () => {
    renderModal({ picturePasswordSettings: { icon_style: 'colorful', show_icon_text: true } });
    expect(screen.getAllByRole('figure')).toHaveLength(3);
    const captions = document.querySelectorAll('figcaption');
    expect(captions).toHaveLength(3);
  });

  it('hides icon labels when show_icon_text is false', () => {
    renderModal({ picturePasswordSettings: { icon_style: 'colorful', show_icon_text: false } });
    const captions = document.querySelectorAll('figcaption');
    expect(captions).toHaveLength(0);
  });
});
