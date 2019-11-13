import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';

module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const response = new Response();

  if (event.invocationSource === 'DialogCodeHook' && !event.currentIntent.slots.KELA_SEARCHING ) {
    return response.returnStartLocating();
  }
  else {
    return response.returnDelegate();
  }

}
