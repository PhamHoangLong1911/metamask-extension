import { ButtonVariant } from '@metamask/snaps-sdk';
import React, { useCallback, useEffect } from 'react';
import {
  BlockaidReason,
  SecurityProvider,
} from '../../../../../shared/constants/security-provider';
import { Alert } from '../../../../ducks/confirm-alerts/confirm-alerts';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderRadius,
  Display,
  FlexDirection,
  IconColor,
  Severity,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import useAlerts from '../../../../hooks/useAlerts';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { useConfirmContext } from '../../../../pages/confirmations/context/confirm';
import {
  Box,
  Button,
  ButtonSize,
  Checkbox,
  Icon,
  IconName,
  IconSize,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '../../../component-library';
import { useAlertActionHandler } from '../contexts/alertActionHandler';
import { useAlertMetrics } from '../contexts/alertMetricsContext';

export type AlertModalProps = {
  /**
   * The unique key representing the specific alert field.
   */
  alertKey: string;
  /**
   * The custom button component for acknowledging the alert.
   */
  customAcknowledgeButton?: React.ReactNode;
  /**
   * The custom checkbox component for acknowledging the alert.
   */
  customAcknowledgeCheckbox?: React.ReactNode;
  /**
   * The custom details component for the alert.
   */
  customDetails?: React.ReactNode;
  /**
   * The custom title for the alert.
   */
  customTitle?: string;
  /**
   * The start (left) content area of ModalHeader.
   * It overrides `startAccessory` of ModalHeaderDefault and by default no content is present.
   */
  headerStartAccessory?: React.ReactNode;
  /**
   * The function invoked when the user acknowledges the alert.
   */
  onAcknowledgeClick: () => void;
  /**
   * The function to be executed when the modal needs to be closed.
   */
  onClose: (request?: { recursive?: boolean }) => void;
  /**
   * The owner ID of the relevant alert from the `confirmAlerts` reducer.
   */
  ownerId: string;
  /**
   * Whether to show the close icon in the modal header.
   */
  showCloseIcon?: boolean;
};

function getSeverityStyle(severity?: Severity) {
  switch (severity) {
    case Severity.Warning:
      return {
        background: BackgroundColor.warningMuted,
        icon: IconColor.warningDefault,
      };
    case Severity.Danger:
      return {
        background: BackgroundColor.errorMuted,
        icon: IconColor.errorDefault,
      };
    default:
      return {
        background: BackgroundColor.backgroundDefault,
        icon: IconColor.infoDefault,
      };
  }
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
function AlertHeader({
  selectedAlert,
  customTitle,
}: {
  selectedAlert: Alert;
  customTitle?: string;
}) {
  const t = useI18nContext();
  const { severity, reason } = selectedAlert;
  const severityStyle = getSeverityStyle(severity);
  return (
    <Box
      gap={3}
      display={Display.Block}
      alignItems={AlignItems.center}
      textAlign={TextAlign.Center}
    >
      <Icon
        name={severity === Severity.Info ? IconName.Info : IconName.Danger}
        size={IconSize.Xl}
        color={severityStyle.icon}
      />
      <Text
        variant={TextVariant.headingSm}
        color={TextColor.inherit}
        marginTop={3}
        marginBottom={4}
      >
        {customTitle ?? reason ?? t('alert')}
      </Text>
    </Box>
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
function BlockaidAlertDetails() {
  const t = useI18nContext();
  const { currentConfirmation } = useConfirmContext();
  const { securityAlertResponse } = currentConfirmation;
  let copy;
  switch (securityAlertResponse?.reason) {
    case BlockaidReason.approvalFarming:
    case BlockaidReason.setApprovalForAll:
    case BlockaidReason.permitFarming:
      copy = t('blockaidAlertDescriptionWithdraw');
      break;
    case BlockaidReason.transferFarming:
    case BlockaidReason.transferFromFarming:
    case BlockaidReason.rawNativeTokenTransfer:
      copy = t('blockaidAlertDescriptionTokenTransfer');
      break;
    case BlockaidReason.seaportFarming:
      copy = t('blockaidAlertDescriptionOpenSea');
      break;
    case BlockaidReason.blurFarming:
      copy = t('blockaidAlertDescriptionBlur');
      break;
    case BlockaidReason.maliciousDomain:
      copy = t('blockaidAlertDescriptionMalicious');
      break;
    case BlockaidReason.rawSignatureFarming:
    case BlockaidReason.tradeOrderFarming:
    case BlockaidReason.other:
    default:
      copy = t('blockaidAlertDescriptionOthers');
  }

  return (
    <Text textAlign={TextAlign.Center} variant={TextVariant.bodyMd}>
      {copy}
    </Text>
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
function AlertDetails({
  selectedAlert,
  customDetails,
}: {
  selectedAlert: Alert;
  customDetails?: React.ReactNode;
}) {
  const t = useI18nContext();
  const severityStyle = getSeverityStyle(selectedAlert.severity);
  return (
    <Box
      key={selectedAlert.key}
      display={Display.InlineBlock}
      padding={customDetails ? 0 : 2}
      width={BlockSize.Full}
      backgroundColor={customDetails ? undefined : severityStyle.background}
      borderRadius={BorderRadius.SM}
    >
      {customDetails ?? (
        <Box>
          {Boolean(selectedAlert.content) && selectedAlert.content}
          {Boolean(selectedAlert.message) && (
            <Text
              variant={TextVariant.bodyMd}
              data-testid="alert-modal__selected-alert"
            >
              {selectedAlert.message}
            </Text>
          )}
          {selectedAlert.alertDetails?.length ? (
            <Text variant={TextVariant.bodyMdBold} marginTop={1}>
              {t('alertModalDetails')}
            </Text>
          ) : null}
          <Box as="ul" className="alert-modal__alert-details" paddingLeft={6}>
            {selectedAlert.alertDetails?.map((detail, index) => (
              <Box as="li" key={`${selectedAlert.key}-detail-${index}`}>
                <Text variant={TextVariant.bodyMd}>{detail}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
export function AcknowledgeCheckboxBase({
  selectedAlert,
  onCheckboxClick,
  isConfirmed,
  label,
}: {
  selectedAlert: Alert;
  onCheckboxClick: () => void;
  isConfirmed: boolean;
  label?: string;
}) {
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (selectedAlert.isBlocking || selectedAlert.severity !== Severity.Danger) {
    return null;
  }

  const t = useI18nContext();
  const severityStyle = getSeverityStyle(selectedAlert.severity);
  return (
    <Box
      display={Display.Flex}
      padding={4}
      width={BlockSize.Full}
      backgroundColor={severityStyle.background}
      borderRadius={BorderRadius.LG}
      marginTop={4}
    >
      <Checkbox
        label={label ?? t('alertModalAcknowledge')}
        data-testid="alert-modal-acknowledge-checkbox"
        isChecked={isConfirmed}
        onChange={onCheckboxClick}
        alignItems={AlignItems.flexStart}
        className="alert-modal__acknowledge-checkbox"
      />
    </Box>
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
function AcknowledgeButton({
  onAcknowledgeClick,
  isConfirmed,
  hasActions,
  isBlocking,
}: {
  onAcknowledgeClick: () => void;
  isConfirmed: boolean;
  hasActions?: boolean;
  isBlocking?: boolean;
}) {
  const t = useI18nContext();

  return (
    <Button
      variant={hasActions ? ButtonVariant.Secondary : ButtonVariant.Primary}
      width={BlockSize.Full}
      onClick={onAcknowledgeClick}
      size={ButtonSize.Lg}
      data-testid="alert-modal-button"
      disabled={!isBlocking && !isConfirmed}
    >
      {t('gotIt')}
    </Button>
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
function ActionButton({
  action,
  onClose,
  alertKey,
}: {
  action?: { key: string; label: string };
  onClose: (request: { recursive?: boolean } | void) => void;
  alertKey: string;
}) {
  const { processAction } = useAlertActionHandler();
  const { trackAlertActionClicked } = useAlertMetrics();

  const handleClick = useCallback(() => {
    if (!action) {
      return;
    }
    trackAlertActionClicked(alertKey);

    processAction(action.key);
    onClose({ recursive: true });
  }, [action, onClose, processAction, trackAlertActionClicked, alertKey]);

  if (!action) {
    return null;
  }

  const { key, label } = action;
  const dataTestId = `alert-modal-action-${key}`;

  return (
    <Button
      data-testid={dataTestId}
      key={key}
      variant={ButtonVariant.Primary}
      width={BlockSize.Full}
      size={ButtonSize.Lg}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
export function AlertModal({
  ownerId,
  onAcknowledgeClick,
  alertKey,
  onClose,
  headerStartAccessory,
  customTitle,
  customDetails,
  customAcknowledgeCheckbox,
  customAcknowledgeButton,
  showCloseIcon = true,
}: AlertModalProps) {
  const { isAlertConfirmed, setAlertConfirmed, alerts } = useAlerts(ownerId);
  const { trackAlertRender } = useAlertMetrics();

  const handleClose = useCallback(
    (...args) => {
      onClose(...args);
    },
    [onClose],
  );

  const selectedAlert = alerts.find((alert: Alert) => alert.key === alertKey);

  useEffect(() => {
    if (selectedAlert) {
      trackAlertRender(selectedAlert.key);
    }
  }, [selectedAlert, trackAlertRender]);

  const isConfirmed = selectedAlert
    ? isAlertConfirmed(selectedAlert.key)
    : false;
  const isAlertDanger = selectedAlert
    ? selectedAlert.severity === Severity.Danger
    : false;

  const handleCheckboxClick = useCallback(() => {
    if (selectedAlert) {
      setAlertConfirmed(selectedAlert.key, !isConfirmed);
    }
  }, [isConfirmed, selectedAlert, setAlertConfirmed]);

  if (!selectedAlert) {
    return null;
  }

  return (
    <Modal isOpen onClose={handleClose} data-testid="alert-modal">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          onClose={showCloseIcon ? handleClose : undefined}
          startAccessory={headerStartAccessory}
          paddingBottom={0}
          display={headerStartAccessory ? Display.InlineFlex : Display.Block}
          closeButtonProps={{
            'data-testid': 'alert-modal-close-button',
          }}
          endAccessory={showCloseIcon ? undefined : null} // Override endAccessory to omit the close icon
        />
        <AlertHeader selectedAlert={selectedAlert} customTitle={customTitle} />
        <ModalBody>
          {selectedAlert.provider === SecurityProvider.Blockaid ? (
            <BlockaidAlertDetails />
          ) : (
            <AlertDetails
              selectedAlert={selectedAlert}
              customDetails={customDetails}
            />
          )}
          {customAcknowledgeCheckbox ?? (
            <AcknowledgeCheckboxBase
              selectedAlert={selectedAlert}
              isConfirmed={isConfirmed}
              onCheckboxClick={handleCheckboxClick}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Column}
            gap={4}
            paddingTop={2}
            width={BlockSize.Full}
          >
            {customAcknowledgeButton ?? (
              <>
                <AcknowledgeButton
                  onAcknowledgeClick={onAcknowledgeClick}
                  isConfirmed={!isAlertDanger || isConfirmed}
                  hasActions={Boolean(selectedAlert.actions)}
                  isBlocking={selectedAlert.isBlocking}
                />
                {(selectedAlert.actions ?? []).map(
                  (action: { key: string; label: string }) => (
                    <ActionButton
                      key={action.key}
                      action={action}
                      onClose={handleClose}
                      alertKey={selectedAlert.key}
                    />
                  ),
                )}
              </>
            )}
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
