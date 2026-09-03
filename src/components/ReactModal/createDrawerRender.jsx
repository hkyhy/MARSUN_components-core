// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/createDrawerRender.js
import Drawer from './Drawer';

const createDrawerRender = (drawerDefaults) => (hostProps) => (
  <Drawer {...drawerDefaults} {...hostProps} />
);

export default createDrawerRender;
