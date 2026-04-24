import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ref } from 'vue';
import { createTranslator } from 'kolibri/utils/i18n';
import useFacilities, { useFacilitiesMock } from 'kolibri-common/composables/useFacilities'; // eslint-disable-line
import useUser, { useUserMock } from 'kolibri/composables/useUser'; // eslint-disable-line
import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
import { LoginErrors } from 'kolibri/constants';
import { picturePasswordStrings } from 'kolibri-common/strings/picturePasswords';
import SignInPage from '../SignInPage';
import makeStore from '../../__tests__/utils/makeStore';

const { usernameLabel$, usernameNotAlphaNumError$, requiredFieldError$ } = coreStrings;
const { bee$, star$, moon$ } = picturePasswordStrings;
const { incorrectPicturePassword$, signInWithUsernameAction$ } = createTranslator(
  SignInPage.name,
  SignInPage.$trs,
);

jest.mock('kolibri/urls');
jest.mock('kolibri/composables/useUser');
jest.mock('kolibri-common/composables/useFacilities');
jest.mock('kolibri-plugin-data', () => ({ allowRemoteAccess: true }));
jest.mock('kolibri-design-system/lib/composables/useKLiveRegion', () => ({
  __esModule: true,
  default: jest.fn(() => ({ sendPoliteMessage: jest.fn() })),
}));

function renderComponent() {
  const store = makeStore();
  store.state.facilityId = '123';
  const selectedFacility = {
    id: 123,
    name: 'test facility',
    dataset: {
      learner_can_login_with_no_password: false,
    },
  };
  useFacilities.mockImplementation(() =>
    useFacilitiesMock({
      facilities: ref([{ id: '123', name: 'test facility', dataset: {} }]),
      getFacility: jest.fn().mockReturnValue(selectedFacility),
    }),
  );

  return render(
    SignInPage,
    {
      store,
      routes: [{ name: 'SIGN_IN', path: '/signin' }],
    },
    (_vue, _store, router) => {
      router.getRoute = () => {
        return { name: 'SIGN_IN', path: '/signin' };
      };
    },
  );
}

describe('signInPage component', () => {
  it('smoke test', async () => {
    renderComponent();
    expect(await screen.findByRole('textbox', { name: usernameLabel$() })).toBeInTheDocument();
  });

  it('will set the username as invalid if it contains punctuation', async () => {
    renderComponent();
    const user = userEvent.setup();

    const usernameInput = await screen.findByRole('textbox', { name: usernameLabel$() });

    await user.type(usernameInput, '?');

    await waitFor(() => {
      expect(screen.getByText(usernameNotAlphaNumError$())).toBeInTheDocument();
    });
  });

  it('will set the validation text to required if the username is empty', async () => {
    renderComponent();
    const user = userEvent.setup();

    const usernameInput = await screen.findByRole('textbox', { name: usernameLabel$() });

    await user.click(usernameInput);
    await user.type(usernameInput, 'a');
    await user.clear(usernameInput);

    await waitFor(() => {
      expect(screen.getByText(requiredFieldError$())).toBeInTheDocument();
    });
  });

  it('will not show validation text if username is empty and not blurred', async () => {
    renderComponent();
    expect(screen.queryByText(requiredFieldError$())).not.toBeInTheDocument();
    expect(screen.queryByText(usernameNotAlphaNumError$())).not.toBeInTheDocument();
  });
});

describe('picture password sign-in', () => {
  const mockLogin = jest.fn();

  const picturePasswordFacility = {
    id: 123,
    name: 'test facility',
    num_users: 100,
    dataset: {
      learner_can_login_with_no_password: true,
      picture_password_settings: { icon_style: 'colorful', show_icon_text: true },
    },
  };

  function renderWithPictureLogin() {
    const store = makeStore();
    useFacilities.mockImplementation(() =>
      useFacilitiesMock({
        facilities: ref([picturePasswordFacility]),
        getFacility: jest.fn().mockReturnValue(picturePasswordFacility),
      }),
    );
    useUser.mockImplementation(() => useUserMock({ login: mockLogin }));
    return render(
      SignInPage,
      { store, routes: [{ name: 'SIGN_IN', path: '/signin' }] },
      (_vue, _store, router) => {
        router.getRoute = () => ({ name: 'SIGN_IN', path: '/signin' });
      },
    );
  }

  beforeEach(() => {
    mockLogin.mockReset();
    window.location.hash = '';
  });

  it('shows the picture password grid instead of the username form', async () => {
    renderWithPictureLogin();
    expect(await screen.findByTestId('submit-button')).toBeInTheDocument();
    // Username textbox is in the DOM (v-show) but not visible
    expect(screen.getByRole('textbox', { name: usernameLabel$(), hidden: true })).not.toBeVisible();
  });

  it('switches to the username form when "sign in with username instead" is clicked', async () => {
    const user = userEvent.setup();
    renderWithPictureLogin();

    await user.click(await screen.findByText(signInWithUsernameAction$()));

    expect(await screen.findByRole('textbox', { name: usernameLabel$() })).toBeVisible();
    expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
  });

  it('calls login with picture_password when a 3-icon sequence is submitted', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);
    renderWithPictureLogin();

    // Select 3 icons by their translated labels (bee=1, star=2, moon=3)
    await user.click(await screen.findByRole('checkbox', { name: bee$() }));
    await user.click(screen.getByRole('checkbox', { name: star$() }));
    await user.click(screen.getByRole('checkbox', { name: moon$() }));
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ picture_password: '1.2.3', facility: 123 }),
      );
    });
  });

  it('shows an error and resets the grid when login returns USER_NOT_FOUND', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(LoginErrors.USER_NOT_FOUND);
    renderWithPictureLogin();

    await user.click(await screen.findByRole('checkbox', { name: bee$() }));
    await user.click(screen.getByRole('checkbox', { name: star$() }));
    await user.click(screen.getByRole('checkbox', { name: moon$() }));
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByText(incorrectPicturePassword$())).toBeInTheDocument();
    // After reset, submit button should be disabled again
    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
