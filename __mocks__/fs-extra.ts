import fsExtra from 'fs-extra';

fsExtra.ensureDirSync = jest.fn();
fsExtra.writeFileSync = jest.fn();

module.exports = fsExtra;
