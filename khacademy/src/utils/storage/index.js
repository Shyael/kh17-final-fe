// 통합 상태(state) 저장소
// - utils/storage/index.js
// - 통합하여 관리할 데이터들을 죠-타이(jotai) 기술에서 제공하는 도구로 생성한뒤 내보내기
// - 필요한 컴포넌트에서 여기서 만든 도구들을 import하여 사용 (properties로 전달할 필요가 없다)

// - 생성방법 : atom 함수 사용

import { atom } from "jotai";
import { atomWithStorage, createJSONStorage, RESET } from "jotai/utils";

//로그인 결과를 저장할 통합상태 생성
// - 새로고침이 되더라도 데이터가 유지될 필요가 있음
// - sessionStorage에 저장하면 현재 화면에서만 유효(데이터 유지)
// - localStorage에 저장하면 껐다 켜도 유효(데이터 유지)

// export const loginUserState = atom(null);//새로고침 시 데이터 사라짐
// export const loginUserState = atomWithStorage("loginUserState", "", window.sessionStorage);//세션 스토리지
// export const loginUserState = atomWithStorage("loginUserState", "", window.localStorage);//로컬 스토리지
// export const loginUserState = atomWithStorage("loginUserState", "");//저장소 미지정 (localStorage에 저장 + 자동직렬화)

// 객체 데이터를 저장하면서 localStorage, sessionStorage를 선택하고싶다면 직렬화 도구를 직접 생성해야함
const localStorageWrapper = createJSONStorage(()=>window.localStorage);
const sessionStorageWrapper = createJSONStorage(()=>window.sessionStorage);
export const loginUserState = atomWithStorage("loginUserState", null, localStorageWrapper);
// export const loginUserState = atomWithStorage("loginUserState", null, sessionStorageWrapper);

// 파생 atom - 다른 atom을 이용해서 계산을 처리한 결과를 만들어내는 atom (=useMemo 훅)
// 생성방법 - atom(초기값) 이 아니라 atom(GETTER, SETTER) 중 필요한걸 넣어서 처리하도록 구현
// [1] 로그인 상태를 판정하는 파생 atom (loginUserState를 가져다가 계산해야함) - GETTER만 필요
export const isLoginState = atom(get=>{
    //기존 atom이 관리하는 데이터 중에서 loginUserState를 불러온다
    const loginUser = get(loginUserState);
    console.log(loginUser); 
    return loginUser !== null;
});
// [2] 직원인지 판정하여 반환하는 파생 atom
export const isEmployeeState = atom(get=>{
    const loginUser = get(loginUserState);
    // if(loginUser === null) return false;
    // return loginUser.accountLevel === "마스터";
    return loginUser?.accountType === "직원";
});

//atom을 변경하기 위한 파생 atom - atom(null, (get,set,파라미터...)=>{});
// [1] 로그인 처리를 수행하는 atom
export const loginActionState = atom(null, (get,set,data)=>{
    //set(변수명, 값);
    set(loginUserState, data);
});
// [2] 로그아웃 처리를 수행하는 atom
export const logoutActionState = atom(null, (get,set)=>{
    //set(변수명, 값);
    set(loginUserState, RESET); //jotai 상태 초기화 + 저장소 제거
});


//마지막에 개발자 도구에 표시될 라벨을 설정 (위치 무관)
loginUserState.debugLabel = "로그인 유저의 정보";
isLoginState.debugLabel = "로그인 상태";
isEmployeeState.debugLabel = "직원 여부";