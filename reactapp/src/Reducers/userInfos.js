export default function (userInfos = null, action) {
    if(action.type == 'joinedRoom'){
        return action.userInfos;
    } else {
        return userInfos;
    }
};