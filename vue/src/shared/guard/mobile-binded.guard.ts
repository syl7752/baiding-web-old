import {getUserInfoCache} from '../api/user.api'
import {Route} from "vue-router";
import router from "../../router";

export const mobileBindedGuard = () => {
  return (to: Route, from: Route): boolean => {
    let userInfo;

    try {
      userInfo = getUserInfoCache();
    } catch (err) {
      return false;
    }

    if (!userInfo.mobile.number) {
      router.push({path: '/mobile-bind', query: {redirectTo: to.fullPath}});
      return false;
    }

    return true;
  }
};

