import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { GlobalContext } from './context/globalContext';
import WelcomePage from 'pages/WelcomePage';
import DeviceSelectorPage from 'pages/DeviceSelectorPage';
import EmulatorSelectorPage from 'pages/EmulatorSelectorPage';
import EmulatorConfigurationPage from 'pages/EmulatorConfigurationPage';
import RomStoragePage from 'pages/RomStoragePage';
import RomStructurePage from 'pages/RomStructurePage';
import AspectRatioSegaPage from 'pages/AspectRatioSegaPage';
import AspectRatioSNESPage from 'pages/AspectRatioSNESPage';
import AspectRatio3DPage from 'pages/AspectRatio3DPage';
import AspectRatioDolphinPage from 'pages/AspectRatioDolphinPage';
import ShadersHandheldsPage from 'pages/ShadersHandheldsPage';
import Shaders2DPage from 'pages/Shaders2DPage';
import Shaders3DPage from 'pages/Shaders3DPage';
import RAAchievementsPage from 'pages/RAAchievementsPage';
import RABezelsPage from 'pages/RABezelsPage';
import PegasusThemePage from 'pages/PegasusThemePage';
import PowerToolsPage from 'pages/PowerToolsPage';
import CheckBiosPage from 'pages/CheckBiosPage';
import CHDToolPage from 'pages/CHDToolPage';
import GyroDSUPage from 'pages/GyroDSUPage';
import ToolsAndStuffPage from 'pages/ToolsAndStuffPage';
import UpdateEmusPage from 'pages/UpdateEmusPage';
import CloudSyncPage from 'pages/CloudSyncPage';
import ChangeLogPage from 'pages/ChangeLogPage';
import SettingsPage from 'pages/SettingsPage';
import UninstallPage from 'pages/UninstallPage';
import ResetPage from 'pages/ResetPage';
import CHDToolPage from 'pages/CHDToolPage';
import RemotePlayWhateverPage from 'pages/RemotePlayWhateverPage';
import VideoGuidePage from 'pages/VideoGuidePage';
import EmuGuidePage from 'pages/EmuGuidePage';

import EndPage from 'pages/EndPage';

import 'getbasecore/src/utils/reset/core_reset.scss';
import 'getbasecore/src/utils/grid-layout/core_grid-layout.scss';
import 'getbasecore/src/components/atoms/Typography/core_typography.scss';

const branch = require('data/branch.json');

export default function App() {
  const [state, setState] = useState({
    version: '',
    branch: branch.branch,
    command: '',
    debug: false,
    debugText: '',
    second: false,
    mode: null,
    system: '',
    device: 'Steam Deck',
    storage: null,
    storagePath: null,
    SDID: '',
    bezels: true,
    powerTools: false,
    GyroDSU: false,
    cloudSync: '',
    sudoPass: '',
    language: 'en',
    achievements: {
      user: '',
      pass: '',
      hardcore: false,
    },
    ar: {
      sega: '43',
      snes: '43',
      classic3d: '43',
      dolphin: '43',
    },
    shaders: {
      handhelds: false,
      classic: false,
      classic3d: false,
    },
    theme: 'EPICNOIR',
    installEmus: {
      ra: { id: 'ra', status: true, name: 'RetroArch' },
      dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
      primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
      ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
      duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
      citra: { id: 'citra', status: true, name: 'Citra' },
      pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
      rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
      yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
      ryujinx: { id: 'ryujinx', status: false, name: 'Ryujinx' },
      xemu: { id: 'xemu', status: true, name: 'Xemu' },
      cemu: { id: 'cemu', status: true, name: 'Cemu' },
      srm: { id: 'srm', status: true, name: 'Steam Rom Manager Parsers' },
      mame: { id: 'mame', status: false, name: 'Mame Standalone' },
      vita3k: { id: 'vita3k', status: true, name: 'Vita 3K (Experimental)' },
      scummvm: { id: 'scummvm', status: true, name: 'Scumm VM' },
      xenia: { id: 'xenia', status: false, name: 'Xenia' },
      //supermodelista: { id: 'supermodelista', status: true, name: 'Supermodelista' },
    },
    overwriteConfigEmus: {
      ra: { id: 'ra', status: true, name: 'RetroArch' },
      dolphin: { id: 'dolphin', status: true, name: 'Dolphin' },
      primehacks: { id: 'primehacks', status: true, name: 'Prime Hacks' },
      ppsspp: { id: 'ppsspp', status: true, name: 'PPSSPP' },
      duckstation: { id: 'duckstation', status: true, name: 'DuckStation' },
      citra: { id: 'citra', status: true, name: 'Citra' },
      pcsx2: { id: 'pcsx2', status: true, name: 'PCSX2' },
      rpcs3: { id: 'rpcs3', status: true, name: 'RPCS3' },
      yuzu: { id: 'yuzu', status: true, name: 'Yuzu' },
      ryujinx: { id: 'ryujinx', status: true, name: 'Ryujinx' },
      xemu: { id: 'xemu', status: true, name: 'Xemu' },
      cemu: { id: 'cemu', status: true, name: 'Cemu' },
      srm: { id: 'srm', status: true, name: 'Steam Rom Manager Parsers' },
      mame: { id: 'mame', status: true, name: 'Mame Standalone' },
      vita3k: { id: 'vita3k', status: true, name: 'Vita 3K (Experimental)' },
      scummvm: { id: 'scummvm', status: true, name: 'Scumm VM' },
      // supermodelista: { id: 'supermodelista', status: true, name: 'Supermodelista' }
    },
  });

  return (
    <GlobalContext.Provider
      value={{
        state,
        setState,
      }}
    >
      <Router>
        <Routes>
          <Route exact path="/" element={<WelcomePage />} />
          <Route exact path="/welcome" element={<WelcomePage />} />
          <Route
            exact
            path="/device-selector"
            element={<DeviceSelectorPage />}
          />
          <Route
            exact
            path="/emulator-selector"
            element={<EmulatorSelectorPage />}
          />
          <Route
            exact
            path="/emulator-configuration"
            element={<EmulatorConfigurationPage />}
          />
          <Route exact path="/rom-storage" element={<RomStoragePage />} />
          <Route exact path="/rom-structure" element={<RomStructurePage />} />
          <Route exact path="/RA-bezels" element={<RABezelsPage />} />
          <Route
            exact
            path="/RA-achievements"
            element={<RAAchievementsPage />}
          />

          <Route
            exact
            path="/aspect-ratio-sega"
            element={<AspectRatioSegaPage />}
          />
          <Route
            exact
            path="/aspect-ratio-snes"
            element={<AspectRatioSNESPage />}
          />
          <Route
            exact
            path="/aspect-ratio-3d"
            element={<AspectRatio3DPage />}
          />
          <Route
            exact
            path="/aspect-ratio-dolphin"
            element={<AspectRatioDolphinPage />}
          />
          <Route
            exact
            path="/shaders-handhelds"
            element={<ShadersHandheldsPage />}
          />
          <Route exact path="/shaders-classic" element={<Shaders2DPage />} />
          <Route exact path="/shaders-3d-classic" element={<Shaders3DPage />} />
          <Route exact path="/gyrodsu" element={<GyroDSUPage />} />
          <Route exact path="/power-tools" element={<PowerToolsPage />} />
          <Route exact path="/chd-tool" element={<CHDToolPage />} />
          <Route exact path="/change-log" element={<ChangeLogPage />} />

          <Route
            exact
            path="/tools-and-stuff"
            element={<ToolsAndStuffPage />}
          />
          <Route exact path="/settings" element={<SettingsPage />} />
          <Route exact path="/check-bios" element={<CheckBiosPage />} />
          <Route exact path="/reset" element={<ResetPage />} />
          <Route exact path="/emulator-guide" element={<EmuGuidePage />}>
            <Route path=":emulator" element={<EmuGuidePage />} />
          </Route>
          <Route exact path="/uninstall" element={<UninstallPage />} />
          <Route
            exact
            path="/remote-play-whatever"
            element={<RemotePlayWhateverPage />}
          />

          <Route exact path="/video-guide" element={<VideoGuidePage />} />
          <Route exact path="/update-emulators" element={<UpdateEmusPage />} />
          <Route exact path="/cloud-sync" element={<CloudSyncPage />} />
          <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
          <Route exact path="/end" element={<EndPage />} />
        </Routes>
      </Router>
    </GlobalContext.Provider>
  );
}
