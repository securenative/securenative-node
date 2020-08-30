import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SDKEvent from "./events/sdk-event";
import {SecureNativeOptions} from "./types/securenative-options";
import {EventOptions} from "./types/event-options";
import EventType from "./enums/event-type";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SdkEvent', () => {
    it('Should fail to create new sdk event when user-id is null', () => {
        const options: SecureNativeOptions = {
            apiKey: 'YOUR_API_KEY',
        };

        const eventOpts: EventOptions = {
            event: EventType.LOG_IN,
            userId: null,
        };

        const event = new SDKEvent(eventOpts, options);
        expect(() => event).to.throw('Invalid event structure; User Id is missing');
    });

    it('Should fail to create new sdk event when event type is null', () => {
        const options: SecureNativeOptions = {
            apiKey: 'YOUR_API_KEY',
        };

        const eventOpts: EventOptions = {
            event: null,
            userId: '1234',
        };

        const event = new SDKEvent(eventOpts, options);
        expect(() => event).to.throw('Invalid event structure; Event Type is missing');
    });
});