
import { useEffect, useRef } from "react";
import ModeGameEngine from "../../game/engine/ModeGameEngine";

export default function GameCanvas({ mode, onUpdate, onReady }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const initialModeRef = useRef(mode);

  const callbacksRef = useRef({
    onUpdate,
    onReady
  });

  useEffect(() => {
    callbacksRef.current = {
      onUpdate,
      onReady
    };
  }, [onUpdate, onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const engine = new ModeGameEngine(
      canvas,
      state => callbacksRef.current.onUpdate?.(state),
      initialModeRef.current
    );

    engineRef.current = engine;

    engine.start();

    callbacksRef.current.onReady?.(engine);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setMode(mode);
  }, [mode]);

  const getPosition = event => {
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handlePointerDown = event => {
    if (!engineRef.current) return;

    event.preventDefault();

    canvasRef.current.setPointerCapture?.(
      event.pointerId
    );

    const { x, y } = getPosition(event);

    engineRef.current.pointerDown(x, y);
  };

  const handlePointerMove = event => {
    if (!engineRef.current) return;

    const { x, y } = getPosition(event);

    engineRef.current.pointerMove(x, y);
  };

  const handlePointerUp = () => {
    engineRef.current?.pointerUp();
  };

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={event => event.preventDefault()}
      aria-label="SLICE STORM gameplay arena. Swipe to slice fruits and avoid bombs."
    />
  );
}
  