import { useLocation } from 'react-router-dom';
import { ExchangeTokenParams } from 'src/features/exchange/exchangeToken';

export function ExchangeConfirmationScreen() {
  const location = useLocation();
  const exchangeState = location.state as ExchangeTokenParams;

  return (
    <span>
      Exchange {exchangeState.amount} from {exchangeState.fromCurrency}
    </span>
  );
}
