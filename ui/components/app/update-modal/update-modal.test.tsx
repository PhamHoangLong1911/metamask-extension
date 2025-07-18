import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useI18nContext } from '../../../hooks/useI18nContext';
import UpdateModal from './update-modal';
import '@testing-library/jest-dom';

const mockStore = configureStore([thunk]);

const initialState = {
  metamask: {
    networkConfigurationsByChainId: {
      '0x1': {
        blockExplorerUrls: [],
        chainId: '0x1',
        defaultRpcEndpointIndex: 0,
        name: 'Ethereum Mainnet',
        nativeCurrency: 'ETH',
        rpcEndpoints: [
          {
            name: 'Eth test 1',
            networkClientId: '96d93309-dab5-45dd-9fff-0d9d7f0843cc',
            type: 'custom',
            url: 'https://eth-mainnet.public.blastapi.io',
          },
          {
            networkClientId: 'mainnet',
            type: 'infura',
            url: 'https://mainnet.infura.io/v3/{infuraProjectId}',
          },
          {
            name: 'Alchemyyyy',
            networkClientId: '40cd2a17-1085-4077-8ffb-1ea1bdc65289',
            type: 'custom',
            url: 'https://eth-mainnet.g.alchemy.com/v2/fCe_AL0z95whoz8H6hvdKvwNAE3goTa0',
          },
          {
            name: 'onfinality',
            networkClientId: '42d0d494-b92f-43f0-9270-51eb660d35a0',
            type: 'custom',
            url: 'https://eth.api.onfinality.io/public',
          },
          {
            name: 'mevBlocker',
            networkClientId: '53107ebb-6184-44b5-ae53-057772795de7',
            type: 'custom',
            url: 'https://rpc.mevblocker.io',
          },
        ],
      },
    },
  },
  TransactionController: {
    transactions: [
      {
        chainId: '0x1',
        history: [{ networkClientId: 'mainnet' }],
      },
    ],
  },
};

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31973
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setup = (props: any) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <UpdateModal {...props} />
    </Provider>,
  );
};

jest.mock('../../../hooks/useI18nContext', () => ({
  useI18nContext: jest.fn(),
}));

describe('UpdateModal', () => {
  const useI18nContextMock = useI18nContext as jest.Mock;

  beforeEach(() => {
    useI18nContextMock.mockReturnValue((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { baseElement } = setup({});
    expect(baseElement).toMatchSnapshot();
  });

  it('renders the modal', () => {
    setup({});
    expect(screen.getByTestId('update-modal')).toBeInTheDocument();
  });
});
