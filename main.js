import { logoData, longitudeData } from './data/3a.js';
import { RankingsApp } from './modules/rankingsApp.js';
import { hidePreloaderAfterLoad, scrollToGenerateIfMobile, scrollToFirstRowIfMobile } from './modules/ui.js';

const app = new RankingsApp(logoData, longitudeData);
// inject helper functions so RankingsApp can call them without owning UI details
app._scrollToGenerateIfMobile = scrollToGenerateIfMobile;
app._scrollToFirstRowIfMobile = scrollToFirstRowIfMobile;
// handle the preloader behavior
hidePreloaderAfterLoad();

