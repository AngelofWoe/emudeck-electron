import React, { useEffect, useState, useContext } from 'react';
import { GlobalContext } from 'context/globalContext';

import DeckyControls from 'components/organisms/Wrappers/DeckyControls.js';

const DeckyControlsPage = () => {
  const { state, setState } = useContext(GlobalContext);
  const [statePage, setStatePage] = useState({
    disabledNext: false,
    disabledBack: false,
    data: '',
    hasSudo: false,
    sudoPass: '',
    showNotification: false,
    disableButton: false,
    pass1: 'a',
    pass2: 'b',
    textNotification: '',
  });
  const {
    disabledNext,
    disabledBack,
    hasSudo,
    sudoPass,
    showNotification,
    pass1,
    pass2,
    textNotification,
    disableButton,
  } = statePage;

  const ipcChannel = window.electron.ipcRenderer;

  const setSudoPass = (data) => {
    if (data.target.value != '') {
      setStatePage({
        ...statePage,
        sudoPass: data.target.value,
      });
    } else {
      setStatePage({
        ...statePage,
        sudoPass: '',
      });
    }
  };

  const createSudo = (data) => {
    ipcChannel.sendMessage('bash', [
      `echo '${pass1}' > test && cat test >> test1 && cat test >> test1 && passwd deck < test1 && rm test test1`,
    ]);
    setStatePage({
      ...statePage,
      hasSudo: true,
      sudoPass: pass1,
      showNotification: true,
      textNotification: '🎉 Password created!',
    });
  };

  const setPassword = (data) => {
    setStatePage({
      ...statePage,
      pass1: data.target.value,
    });
  };

  const checkPassword = (data) => {
    setStatePage({
      ...statePage,
      pass2: data.target.value,
    });
  };

  const installDeckyControls = (data) => {
    setStatePage({
      ...statePage,
      disableButton: true,
    });

    ipcChannel.sendMessage('emudeck', [
      `DeckyControls|||echo '${sudoPass}' | sudo -v -S && Plugins_installPluginLoader && Plugins_installDeckyControls && echo true`,
    ]);

    ipcChannel.once('DeckyControls', (status) => {
      console.log({ status });
      const stdout = status.stdout;
      const sterr = status.stdout;
      const error = status.error;

      if (stdout.includes('true')) {
        setStatePage({
          ...statePage,
          showNotification: true,
          textNotification: '🎉 DeckyControls Installed!',
          sudoPass: '',
        });
        if (showNotification === true) {
          setTimeout(() => {
            setStatePage({
              ...statePage,
              showNotification: false,
            });
          }, 2000);
        }
      } else {
        setStatePage({
          ...statePage,
          showNotification: true,
          textNotification: JSON.stringify(status.stderr),
        });
        if (showNotification === true) {
          setTimeout(() => {
            setStatePage({
              ...statePage,
              showNotification: false,
            });
          }, 2000);
        }
      }
    });
  };

  //

  useEffect(() => {
    ipcChannel.sendMessage('bash', [
      'checkPWD|||passwd -S $(whoami) | awk -F " " "{print $2}" & exit',
    ]);

    ipcChannel.once('checkPWD', (stdout) => {
      console.log({ stdout });
      stdout = stdout.replace('\n', '');
      stdout.includes('NP') ? (stdout = false) : (stdout = true);
      setStatePage({
        ...statePage,
        hasSudo: stdout,
      });
    });
  }, []);

  return (
    <DeckyControls
      showNotification={showNotification}
      installClick={installDeckyControls}
      sudoPass={sudoPass}
      disabledNext={disabledNext}
      disabledBack={disabledBack}
      onChange={setSudoPass}
      onChangeSetPass={setPassword}
      onChangeCheckPass={checkPassword}
      onClick={createSudo}
      disableButton={disableButton}
      hasSudo={hasSudo}
      passValidates={pass1 === pass2 ? true : false}
      nextText={sudoPass ? 'Continue' : 'Skip'}
      textNotification={textNotification}
    />
  );
};

export default DeckyControlsPage;
