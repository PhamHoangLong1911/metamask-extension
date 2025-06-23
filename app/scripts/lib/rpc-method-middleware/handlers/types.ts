import { JsonRpcParams, JsonRpcRequest } from '@metamask/utils';
import {
  AddApprovalOptions,
  ApprovalFlowStartResult,
  EndFlowOptions,
  StartFlowOptions,
} from '@metamask/approval-controller';
import {
  NetworkClientId,
  NetworkConfiguration,
} from '@metamask/network-controller';
import type {
  CaveatConstraint,
  CaveatSpecificationConstraint,
  ExtractPermission,
  OriginString,
  PermissionController,
  PermissionSpecificationConstraint,
  PermissionsRequest,
  PermissionSubjectMetadata,
  RequestedPermissions,
  SubjectPermissions,
  SubjectType,
} from '@metamask/permission-controller';
import { PermissionController } from '@metamask/permission-controller';
import type { Hex, Json } from '@metamask/utils';
import { InfuraNetworkType } from '@metamask/controller-utils';
import {
  MetaMetricsEventPayload,
  MetaMetricsPageOptions,
} from '../../../../../shared/constants/metametrics';
import { MessageType } from '../../../../../shared/constants/app';

export type HandlerWrapper = {
  methodNames: [MessageType] | MessageType[];
  hookNames: Record<string, boolean>;
};

export type HandlerRequestType<Params extends JsonRpcParams = JsonRpcParams> =
  Required<JsonRpcRequest<Params>> & {
    origin: string;
  };

export type ExistingNetworkChainIds = '0x1' | '0xaa36a7' | '0xe704' | '0xe708';

export type NetworkConfigurations = Record<
  string,
  NetworkConfiguration & {
    id: string;
  }
>;

/**
 * @property chainId - The current chain ID.
 * @property isUnlocked - Whether the extension is unlocked or not.
 * @property networkVersion - The current network ID.
 * @property accounts - List of permitted accounts for the specified origin.
 */
export type ProviderStateHandlerResult = {
  chainId: string;
  isUnlocked: boolean;
  networkVersion: string;
  accounts: string[];
};

export type SubjectMetadataToAdd = PermissionSubjectMetadata & {
  name?: string | null;
  subjectType?: SubjectType | null;
  extensionId?: string | null;
  iconUrl?: string | null;
} & Record<string, Json>;

export type UpsertNetworkConfigurationOptions = {
  referrer: string;
  source: string;
  setActive?: boolean;
};

export type AddSubjectMetadata = (metadata: SubjectMetadataToAdd) => void;

export type EndApprovalFlow = ({ id }: EndFlowOptions) => void;

export type FindNetworkClientIdByChainId = (chainId: Hex) => NetworkClientId;

export type FindNetworkConfigurationBy = (
  rpcInfo: Record<string, string>,
) => NetworkConfiguration | null;

export type HasPermission = (origin: OriginString) => boolean;

export type GetAccounts = (options: { ignoreLock: boolean }) => Promise<Hex[]>;

export type GetCurrentChainId = () => Hex;

export type GetCurrentRpcUrl = () => string | undefined;

export type GetNetworkConfigurations = () => NetworkConfiguration;

export type RequestCaip25ApprovalForOrigin = (
  origin?: OriginString,
  requestedPermissions?: PermissionsRequest['permissions'],
) => Promise<RequestedPermissions>;

export type GrantPermissionsForOrigin = (
  approvedPermissions: RequestedPermissions,
) => ReturnType<
  PermissionController<
    PermissionSpecificationConstraint,
    CaveatConstraint
  >['grantPermissions']
>;

export type GetProviderState = (
  origin: OriginString,
) => Promise<ProviderStateHandlerResult>;

export type GetUnlockPromise = (
  shouldShowUnlockRequest: boolean,
) => Promise<void>;

export type GetWeb3ShimUsageState = (origin: OriginString) => undefined | 1 | 2;

export type HandleWatchAssetRequest = (
  options: Record<string, string>,
) => Promise<void>;

export type RequestAccountsPermission<
  ControllerPermissionSpecification extends PermissionSpecificationConstraint = PermissionSpecificationConstraint,
  ControllerCaveatSpecification extends CaveatSpecificationConstraint = CaveatSpecificationConstraint,
> = (
  subject?: PermissionSubjectMetadata,
  requestedPermissions?: RequestedPermissions,
  options?: {
    id?: string;
    preserveExistingPermissions?: boolean;
  },
) => Promise<
  [
    SubjectPermissions<
      ExtractPermission<
        ControllerPermissionSpecification,
        ControllerCaveatSpecification
      >
    >,
    {
      data?: Record<string, unknown>;
      id: string;
      origin: OriginString;
    },
  ]
>;

export type RequestUserApproval = (
  options?: AddApprovalOptions,
) => Promise<unknown>;

export type SendMetrics = (
  payload: MetaMetricsEventPayload,
  options?: MetaMetricsPageOptions,
) => void;

export type SetActiveNetwork = (
  networkConfigurationIdOrType: string,
) => Promise<void>;

export type SetNetworkClientIdForDomain = (
  domain: string,
  networkClientId: NetworkClientId,
) => void;

export type SetProviderType = (type: InfuraNetworkType) => Promise<void>;

export type SetWeb3ShimUsageRecorded = (origin: OriginString) => void;

export type StartApprovalFlow = (
  options?: StartFlowOptions,
) => ApprovalFlowStartResult;

export type UpsertNetworkConfiguration = (
  networkConfiguration: NetworkConfiguration,
  options?: UpsertNetworkConfigurationOptions,
) => Promise<string>;
type AbstractPermissionController = PermissionController<
  PermissionSpecificationConstraint,
  CaveatSpecificationConstraint
>;

export type GrantedPermissions = Awaited<
  ReturnType<AbstractPermissionController['requestPermissions']>
>[0];
