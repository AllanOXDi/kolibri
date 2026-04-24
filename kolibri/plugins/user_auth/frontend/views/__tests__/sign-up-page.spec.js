import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ref, computed } from 'vue';
import useFacility, { useFacilityMock } from 'kolibri-common/composables/useFacility'; // eslint-disable-line
import redirectBrowser from 'kolibri/utils/redirectBrowser';
import client from 'kolibri/client';
import { createTranslator } from 'kolibri/utils/i18n';
import { picturePasswordStrings } from 'kolibri-common/strings/picturePasswords';
import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
import PasswordTextbox from 'kolibri-common/components/userAccounts/PasswordTextbox';
import SignUpPage from '../SignUpPage';
import { SignUpResource } from '../../apiResource';
import makeStore from '../../__tests__/utils/makeStore';

jest.mock('kolibri-common/composables/useFacility');
jest.mock('kolibri/utils/redirectBrowser');
jest.mock('kolibri/client');
jest.mock('kolibri/urls');
jest.mock('../../apiResource', () => ({
  SignUpResource: { saveModel: jest.fn() },
}));

const { yourPicturePassword$ } = picturePasswordStrings;
const { finishAction$, fullNameLabel$, usernameLabel$, passwordLabel$, continueAction$ } =
  coreStrings;
const { confirmPasswordLabel$ } = createTranslator(PasswordTextbox.name, PasswordTextbox.$trs);

const selectedFacility = ref({
  id: 1,
  name: 'Facility 1',
  dataset: {
    learner_can_login_with_no_password: false,
  },
});

function renderComponent() {
  const store = makeStore();

  useFacility.mockReturnValue(
    useFacilityMock({
      selectedFacility,
      facilityConfig: ref({ learner_can_login_with_no_password: false }),
      facilityId: computed(() => selectedFacility.value?.id || null),
      currentFacilityName: computed(() => selectedFacility.value?.name || ''),
    }),
  );

  return render(
    SignUpPage,
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

describe('signUpPage component', () => {
  it('smoke test', () => {
    renderComponent();
    expect(screen.getByTestId('facilityLabel')).toBeInTheDocument();
  });
});

describe('multiFacility signUpPage component', () => {
  it('right facility', async () => {
    renderComponent();
    expect(screen.getByTestId('facilityLabel')).toHaveTextContent('Facility 1');
    const FACILITY_2_NAME = 'Facility 2';
    selectedFacility.value = {
      id: 2,
      name: FACILITY_2_NAME,
      dataset: { learner_can_login_with_no_password: false },
    };
    expect(await screen.findByText(FACILITY_2_NAME)).toBeInTheDocument();
  });
});

describe('picture password modal after signup', () => {
  const pictureLoginFacilityConfig = ref({
    learner_can_login_with_no_password: true,
    picture_password_settings: { icon_style: 'colorful', show_icon_text: true },
  });

  function renderWithPictureLogin() {
    const store = makeStore();
    useFacility.mockReturnValue(
      useFacilityMock({
        selectedFacility,
        facilityConfig: pictureLoginFacilityConfig,
        facilityId: computed(() => selectedFacility.value?.id || null),
        currentFacilityName: computed(() => selectedFacility.value?.name || ''),
      }),
    );
    return render(
      SignUpPage,
      { store, routes: [{ name: 'SIGN_IN', path: '/signin' }] },
      (_vue, _store, router) => {
        router.getRoute = () => ({ name: 'SIGN_IN', path: '/signin' });
      },
    );
  }

  async function submitForm() {
    const user = userEvent.setup();
    client.mockResolvedValue({});
    // Fill in required step 1 fields
    await user.type(screen.getByRole('textbox', { name: fullNameLabel$() }), 'Test User');
    await user.type(screen.getByRole('textbox', { name: usernameLabel$() }), 'testuser');
    // Fill in password fields if shown (when learner_can_login_with_no_password is false)
    const passwordInput = screen.queryByLabelText(passwordLabel$());
    if (passwordInput) {
      await user.type(passwordInput, 'password123');
      await user.type(screen.getByLabelText(confirmPasswordLabel$()), 'password123');
    }
    // Step 1 → step 2
    await user.click(screen.getByRole('button', { name: continueAction$() }));
    await global.flushPromises();
    // Step 2 → submit
    await user.click(await screen.findByRole('button', { name: finishAction$() }));
    await global.flushPromises();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset hash so each test's router starts at '/' rather than inheriting
    // the previous test's navigation state (Vue Router uses hash mode by default).
    window.location.hash = '';
  });

  it('shows picture password modal when facility has picture login and signup returns a picture_password', async () => {
    SignUpResource.saveModel.mockResolvedValue({ picture_password: '3.7.12' });
    renderWithPictureLogin();
    await submitForm();
    expect(await screen.findByText(yourPicturePassword$())).toBeInTheDocument();
    expect(redirectBrowser).not.toHaveBeenCalled();
  });

  it('redirects without showing the modal when picture_password is null', async () => {
    SignUpResource.saveModel.mockResolvedValue({ picture_password: null });
    renderWithPictureLogin();
    await submitForm();
    expect(redirectBrowser).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(yourPicturePassword$())).not.toBeInTheDocument();
  });

  it('redirects without showing the modal when facility has no picture_password_settings', async () => {
    SignUpResource.saveModel.mockResolvedValue({ picture_password: '3.7.12' });
    const store = makeStore();
    useFacility.mockReturnValue(
      useFacilityMock({
        selectedFacility,
        facilityConfig: ref({
          learner_can_login_with_no_password: false,
          picture_password_settings: null,
        }),
        facilityId: computed(() => selectedFacility.value?.id || null),
        currentFacilityName: computed(() => selectedFacility.value?.name || ''),
      }),
    );
    render(
      SignUpPage,
      { store, routes: [{ name: 'SIGN_IN', path: '/signin' }] },
      (_vue, _store, router) => {
        router.getRoute = () => ({ name: 'SIGN_IN', path: '/signin' });
      },
    );
    await submitForm();
    expect(redirectBrowser).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(yourPicturePassword$())).not.toBeInTheDocument();
  });
});
