import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";

const HeartAnimation = ({ bpm }) => {
  const duration = (60 / bpm) * 1000;
  const [isBeating, setIsBeating] = useState(false);

  // Animation du cœur
  const heartBeat = useSpring({
    transform: isBeating ? "scale(1.1)" : "scale(1)",
    config: { duration },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBeating(true);
      setTimeout(() => {
        setIsBeating(false);
      }, duration / 2);
    }, duration);

    return () => {
      clearInterval(interval);
    };
  }, [duration]);

  return (
    <div>
      <animated.img
        src="images/heart.png"
        style={heartBeat}
        alt="Heart"
      />
    </div>
  );
};

export default HeartAnimation;
