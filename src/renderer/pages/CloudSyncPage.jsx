import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';
import Wrapper from 'components/molecules/Wrapper/Wrapper';
import Header from 'components/organisms/Header/Header';
import Footer from 'components/organisms/Footer/Footer';

import CloudSync from 'components/organisms/Wrappers/CloudSync';

function CloudSyncPage() {
  const { state, setState } = useContext(GlobalContext);
  const json = JSON.stringify(state);
  const { cloudSync, system } = state;
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    disableButton: false,
  });
  const { disabledNext, disabledBack, disableButton } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const cloudSyncSet = (item) => {
    setState({
      ...state,
      cloudSync: item,
    });
  };

  // const createDesktopIcon = () => {
  //   ipcChannel.sendMessage('emudeck', [`save-setting|||rclone_setup`]);
  // };

  const installRclone = () => {
    if (
      confirm(
        'Press OK if you already have CloudSync installed on another EmuDeck installation and you want to sync that installation to this one, if not, press Cancel'
      ) === true
    ) {
      ipcChannel.sendMessage('emudeck', [
        `cloud_sync_install_and_config_with_code|||cloud_sync_install_and_config_with_code ${cloudSync}`,
      ]);
      ipcChannel.once('cloud_sync_install_and_config_with_code', (message) => {
        // No versioning found, what to do?
        console.log('cloudSync', message);
        alert(
          `All Done, every time you load a game your Game states and Saved games will be synced to ${cloudSync}`
        );
      });
    } else {
      alert(
        `A web browser will open so you can log in to your Cloud provider, after that every time you load a Game your Game states and Saved games will be synced to the cloud`
      );

      ipcChannel.sendMessage('emudeck', [
        `cloud_sync_install_and_config|||cloud_sync_install_and_config ${cloudSync}`,
      ]);

      ipcChannel.once('cloud_sync_install_and_config', (message) => {
        console.log('cloudSync', message);
      });
    }
  };

  const uninstallRclone = () => {
    ipcChannel.sendMessage('emudeck', [
      `cloud_sync_uninstall|||cloud_sync_uninstall`,
    ]);
    ipcChannel.once('cloud_sync_uninstall', (message) => {
      // No versioning found, what to do?
      setStatePage({
        ...state,
        cloudSync: null,
      });
      alert(`Cloud Sync uninstalled`);
    });
  };

  useEffect(() => {
    ipcChannel.sendMessage('emudeck', [
      `save-setting|||setSetting rclone_provider ${cloudSync}`,
    ]);
    localStorage.setItem('settings_emudeck', json);
  }, [cloudSync]);

  return (
    <Wrapper>
      <Header title="Cloud Sync - BETA" />
      <CloudSync
        onClick={cloudSyncSet}
        onClickInstall={installRclone}
        onClickUnnstall={uninstallRclone}
        disableButton={disableButton}
      />
      <Footer
        next={false}
        disabledNext={disabledNext}
        disabledBack={disabledBack}
      />
    </Wrapper>
  );
}

export default CloudSyncPage;
