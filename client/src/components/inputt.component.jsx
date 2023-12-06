import { useState } from "react";
import EyeSlash from "../icons/eye-slash.icon";
import Eye from "../icons/eye.icon";

const Input = ({
  type,
  name,
  placeholder,
  className,
  value,
  handleInputChange,
  icon,
  disabled = false
}) => {
  const [isShow, setIsShow] = useState(false);

  return (
    <div className="relative w-[100%] mb-6">
      <input
        type={type === "password" ? (isShow ? "text" : "password") : type}
        name={name}
        placeholder={placeholder}
        className={className}
        value={value}
        onChange={(e) => handleInputChange(e)}
        disabled={disabled}
      />
      <i className={`fi ${icon} input-icon`}></i>

      {type === "password" && isShow ? (
        <Eye
          className="w-6 h-6 cursor-pointer absolute top-[15px] right-[10px]"
          setIsShow={setIsShow}
          isShow={isShow}
        />
      ) : (
        type === "password" && (
          <EyeSlash
            className="w-6 h-6 cursor-pointer absolute top-[15px] right-[10px]"
            setIsShow={setIsShow}
            isShow={isShow}
          />
        )
      )}
    </div>
  );
};

export default Input;
