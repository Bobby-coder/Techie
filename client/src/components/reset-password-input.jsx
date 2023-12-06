import { useState } from "react";
import EyeSlash from "../icons/eye-slash.icon";
import Eye from "../icons/eye.icon";

const ResetPasswordInput = ({value, setFun, label, id, labelFor})=> {
  const [isShow, setIsShow] = useState(false);
  return (
    <div className="relative">
      <label
        for={labelFor}
        class="block mb-2 text-[14px] font-medium text-gray-900"
      >
        {label}
      </label>
      <input
        id={id}
        type={isShow ? "text" : "password"}
        placeholder="••••••••"
        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        onChange={(e) => setFun(e.target.value)}
        value={value}
      />
      {isShow ? (
        <Eye
          className="w-6 h-6 cursor-pointer absolute top-[34px] right-[10px]"
          setIsShow={setIsShow}
          isShow={isShow}
        />
      ) : (
        <EyeSlash
          className="w-6 h-6 cursor-pointer absolute top-[34px] right-[10px]"
          setIsShow={setIsShow}
          isShow={isShow}
        />
      )}
    </div>
  );
};

export default ResetPasswordInput;
