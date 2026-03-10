import * as React from "react";

export const TabSelector = ({
                              isActive,
                              children,
                              onClick,
                            }: {
  isActive: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const style = {
    color: "white",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderBottom: "none",
  };

  const activeStyle = {
    color: "white",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderBottom: "solid",
    borderBottomColor: "#029CFD",
  };
  return (
    <button style={isActive ? activeStyle : style} onClick={onClick}>
      {children}
    </button>
  );
};
