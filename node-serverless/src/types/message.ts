type StringObject = {
  stringValue: string;
}

type MerchResult = {
  name: StringObject;
  gms_desc: StringObject;
  link: StringObject;
  gms_name: StringObject;
  id: StringObject;
  price: StringObject;
}

type PhoneResult = {
  name: StringObject;
  condition: StringObject;
  availability: StringObject;
  link: StringObject;
  id: StringObject;
  price: StringObject;
  currency: StringObject;
}

type Message = {
  content: string|MerchResult|PhoneResult;
  timestamp: Date;
  state: string;
  triggerSearch?: boolean;
  audioSynthesis?: boolean;
  delayAudioSynthesis?: boolean;
}

export {
  Message,
  PhoneResult,
  MerchResult
}
