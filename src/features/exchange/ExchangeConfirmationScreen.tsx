import { useLocation } from 'react-router-dom';
import { ExchangeTokenParams } from 'src/features/exchange/exchangeToken';

export function ExchangeConfirmationScreen() {
  const location = useLocation();
  const state = location.state as ExchangeTokenParams;

  return (
    <span>
      Exchange {state.amount} from {state.fromCurrency}
    </span>
  );
}
