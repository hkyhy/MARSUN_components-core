// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/createModalRender.js
import Modal from './Modal';

const createModalRender = (modalDefaults) => (hostProps) => (
  <Modal {...modalDefaults} {...hostProps} />
);

export default createModalRender;
