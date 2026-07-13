function PauseGame({ onStart }) {
  return (
    <div className="start-page">
      <button onClick={onStart}>Continue</button>
    </div>
  );
}

export default PauseGame;