import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const getRandomColor = () => {
  const colors = [
    ["from-red-500", "to-yellow-500"],
    ["from-green-500", "to-blue-500"],
    ["from-purple-500", "to-pink-500"],
    ["from-indigo-500", "to-cyan-500"],
    ["from-yellow-500", "to-orange-500"],
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomPosition = () => {
  const margin = 24;
  const size = 64;
  const { innerWidth, innerHeight } = window;
  const x = Math.random() * (innerWidth - size - margin * 2) + margin;
  const y = Math.random() * (innerHeight - size - margin * 2) + margin;
  return { x, y };
};

const ToggleCircle = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- existing toggle state ---
  const [toggled, setToggled] = useState(location.pathname === "/movies");
  const [moving, setMoving] = useState(false);
  const [color, setColor] = useState(getRandomColor());

  // --- drag + position state ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });

  // sync toggle with URL
  useEffect(() => {
    setToggled(location.pathname === "/movies");
  }, [location.pathname]);

  // initial placement at bottom-right
  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    setPosition({
      x: innerWidth - 64 - 24,
      y: innerHeight - 64 - 24,
    });
  }, []);

  // global drag listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      if (!hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        setHasMoved(true);
      }

      setPosition({
        x: dragStartRef.current.x + dx,
        y: dragStartRef.current.y + dy,
      });
    };
    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, hasMoved]);

  const handleMouseDown = (e) => {
    if (moving) return;
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      x: position.x,
      y: position.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  const handleClick = (e) => {
    // block toggle if animating, dragging, a drag happened, or double-click
    if (
      moving ||
      isDragging ||
      hasMoved ||
      e.detail > 1
    ) return;

    setMoving(true);
    setColor(getRandomColor());

    setTimeout(() => {
      navigate(toggled ? "/shop" : "/movies");
      setTimeout(() => setMoving(false), 600);
    }, 500);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // reposition circle randomly, do not toggle
    setPosition(getRandomPosition());
  };

  const animatedTransform = `translate(${moving ? -120 : 0}px, 0) scale(${moving ? 1.1 : 1}) rotate(${moving ? -180 : 0}deg)`;

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: animatedTransform,
        transition:
          "transform 0.5s ease-in-out, background 0.5s ease-in-out",
        zIndex: 50,
        width: 64,
        height: 64,
      }}
      className={`
        rounded-full bg-gradient-to-r ${color[0]} ${color[1]}
        shadow-lg flex items-center justify-center
        cursor-pointer hover:shadow-xl active:scale-95
      `}
    >
      <span className="text-white font-bold text-lg">
        {toggled ? "Shop" : "Movie"}
      </span>
    </div>
  );
};

export default ToggleCircle;
