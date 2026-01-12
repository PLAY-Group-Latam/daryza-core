import { route as ziggyRoute } from 'ziggy-js';
import { Config, RouteParams } from 'ziggy-js';
import { Ziggy } from '@/ziggy';

export function route(
  name: string,
  params: RouteParams<string> = {},
  absolute = false
) {
  return ziggyRoute(name, params, absolute, Ziggy as unknown as Config);
}

