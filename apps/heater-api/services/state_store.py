import json
import os
import threading
from pathlib import Path
from typing import Optional

from pydantic import BaseModel, Field, ValidationError

from schemas.temp_control import Parameters


class ChannelPersistedState(BaseModel):
    """Per-channel persisted operator state."""
    target_temp: Optional[float] = None
    kp: Optional[float] = None
    ki: Optional[float] = None
    kd: Optional[float] = None


class PersistedState(BaseModel):
    """Top-level persisted state file shape."""
    channels: dict[int, ChannelPersistedState] = Field(default_factory=dict)


class StateStore:
    """Persist operator-tunable PID state (target temp, Kp/Ki/Kd) to disk.

    Atomic writes via tempfile + os.replace; corrupt or missing files fall
    back to defaults so the API still boots. Saves are best-effort and never
    raise — disk failures are logged but the in-memory value remains correct.
    """

    def __init__(self, path: str | os.PathLike):
        self._path = Path(path)
        self._lock = threading.Lock()

    def load(self) -> PersistedState:
        if not self._path.exists():
            return PersistedState()
        try:
            with open(self._path) as f:
                data = json.load(f)
            return PersistedState(**data)
        except (OSError, json.JSONDecodeError, ValidationError) as e:
            print(f"[StateStore] Failed to read {self._path}: {e}; using defaults")
            return PersistedState()

    def save_target(self, channel_id: int, target: float) -> None:
        with self._lock:
            state = self.load()
            slot = state.channels.get(channel_id, ChannelPersistedState())
            slot.target_temp = target
            state.channels[channel_id] = slot
            self._write_atomic(state)

    def save_parameters(self, channel_id: int, params: Parameters) -> None:
        with self._lock:
            state = self.load()
            slot = state.channels.get(channel_id, ChannelPersistedState())
            slot.kp = params.kp
            slot.ki = params.ki
            slot.kd = params.kd
            state.channels[channel_id] = slot
            self._write_atomic(state)

    def _write_atomic(self, state: PersistedState) -> None:
        try:
            self._path.parent.mkdir(parents=True, exist_ok=True)
            tmp = self._path.with_name(self._path.name + ".tmp")
            with open(tmp, "w") as f:
                json.dump(state.model_dump(mode="json"), f, indent=2)
            os.replace(tmp, self._path)
        except OSError as e:
            print(f"[StateStore] Failed to write {self._path}: {e}")
