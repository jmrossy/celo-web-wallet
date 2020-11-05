import { useLocation } from 'react-router-dom';
import { SendTokenParams } from 'src/features/send/sendToken';

export function RequestConfirmationScreen() {
  const location = useLocation();
  const state = location.state as SendTokenParams;

  return (
    <span>
      request {state.amount} from {state.recipient}
    </span>
  );
}
