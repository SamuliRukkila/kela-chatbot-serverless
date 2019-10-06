import { LexEvent } from '../../classes/LexEvent';

module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const response = new Response();

  if (event.currentIntent.confirmationStatus === 'Confirmed' &&
    event.currentIntent.slots.Kela_PIN) {

  }


  else if (event.invocationSource === 'DialogCodeHook' && event.currentIntent.slots.Kela_PIN) {

  }


  else {
  }


};
