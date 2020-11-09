import chai from 'chai';
import { SecureNativeOptions } from "./types/securenative-options";
import { clientIpFromRequest } from "./utils/utils";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ModuleManager', () => {
it('extract a request with proxy headers ipv4', () => {
    const options : SecureNativeOptions = {
        proxyHeaders: ['CF-Connecting-IP']
    };

    const ip = '203.0.113.1'

    const clientIp = clientIpFromRequest(req, options)
    expect(clientIp).to.eq(ip)
});

it('extract a request with proxy headers ipv6', () => {
    const options : SecureNativeOptions = {
        proxyHeaders: ['CF-Connecting-IP']
    };

    const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d'

    const clientIp = clientIpFromRequest(req, options)
    expect(clientIp).to.eq(ip)
});

it('extract a request with proxy headers multiple ipv4', () => {
    const options : SecureNativeOptions = {
        proxyHeaders: ['CF-Connecting-IP']
    };

    const ips = ['141.246.115.116', '203.0.113.1', '12.34.56.3']

    const clientIp = clientIpFromRequest(req, options)
    expect(clientIp).to.eq(ips[0])
});