import chai from 'chai';
import { SecureNativeOptions } from "./types/securenative-options";
import { clientIpFromRequest, headersFromRequest } from "./utils/utils";
import chaiAsPromised from "chai-as-promised";
import httpMocks from 'node-mocks-http';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RequestUtils', () => {
    it('extract ip from request with proxy headers ipv4', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = '203.0.113.1';
        const req = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip from request with proxy headers ipv6', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip from request with proxy headers multiple ipv4', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-forwarded-for header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-forwarded-for header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-client-ip header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-client-ip header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-real-ip header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-real-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-real-ip header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-real-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-forwarded header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-forwarded header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-cluster-client-ip header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-cluster-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-cluster-client-ip header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-cluster-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using forwarded-for header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using forwarded-for header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using forwarded header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using forwarded header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using via header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'via': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using via header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'via': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using priority with x forwarded for', () => {
        const options: SecureNativeOptions = {};

        const ip = '203.0.113.1';
        const req = httpMocks.createRequest({
            headers: {
                'x-forwarded-for': ip,
                'x-real-ip': '198.51.100.101',
                'x-client-ip': '198.51.100.102'
            }
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using priority without x forwarded for', () => {
        const options: SecureNativeOptions = {};

        const ip = '203.0.113.1, 141.246.115.116, 12.34.56.3'
        const expected = '203.0.113.1';
        const req = httpMocks.createRequest({
            headers: {
                'x-real-ip': '203.0.113.1',
                'x-client-ip': ip
            }
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('strip down pii data from headers', () => {
        const piiHeaders = {
            'Host': 'net.example.com',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5 (.NET CLR 3.5.30729)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Accept-Encoding': 'gzip,deflate',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
            'Keep-Alive': '300',
            'Connection': 'keep-alive',
            'Cookie': 'PHPSESSID=r2t5uvjq435r4q7ib3vtdjq120',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'authorization': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'access_token': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'apikey': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'password': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'passwd': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'secret': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'api_key': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z'
        };

        const req = httpMocks.createRequest({
            headers: piiHeaders
        });

        const h = headersFromRequest(req, null);
        expect(h.authorization).to.eq(undefined);
        expect(h.access_token).to.eq(undefined);
        expect(h.apikey).to.eq(undefined);
        expect(h.passwd).to.eq(undefined);
        expect(h.secret).to.eq(undefined);
        expect(h.api_key).to.eq(undefined);
    });

    it('strip down pii data from regex pattern', () => {
        const piiHeaders = {
            'Host': 'net.example.com',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5 (.NET CLR 3.5.30729)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Accept-Encoding': 'gzip,deflate',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
            'Keep-Alive': '300',
            'Connection': 'keep-alive',
            'Cookie': 'PHPSESSID=r2t5uvjq435r4q7ib3vtdjq120',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'http_auth_authorization': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'http_auth_access_token': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'http_auth_apikey': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'http_auth_password': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'http_auth_passwd': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'http_auth_secret': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'http_auth_api_key': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z'
        };

        const req = httpMocks.createRequest({
            headers: piiHeaders
        });

        const options: SecureNativeOptions = {
            piiRegexPattern: '/http_auth_/i',
        };

        const h = headersFromRequest(req, options);
        expect(h.http_auth_authorization).to.eq(undefined);
        expect(h.http_auth_access_token).to.eq(undefined);
        expect(h.http_auth_apikey).to.eq(undefined);
        expect(h.http_auth_passwd).to.eq(undefined);
        expect(h.http_auth_secret).to.eq(undefined);
        expect(h.http_auth_api_key).to.eq(undefined);
    });

    it('strip down pii data from custom headers', () => {
        const piiHeaders = {
            'Host': 'net.example.com',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5 (.NET CLR 3.5.30729)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Accept-Encoding': 'gzip,deflate',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
            'Keep-Alive': '300',
            'Connection': 'keep-alive',
            'Cookie': 'PHPSESSID=r2t5uvjq435r4q7ib3vtdjq120',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'authorization': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'access_token': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'apikey': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'password': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'passwd': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'secret': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z',
            'api_key': 'ylSkZIjbdWybfs4fUQe9BqP0LH5Z'
        };

        const req = httpMocks.createRequest({
            headers: piiHeaders
        });

        const options: SecureNativeOptions = {
            piiHeaders: ['authorization', 'access_token', 'apiKey', 'password', 'passwd', 'secret', 'api_key'],
        };

        const h = headersFromRequest(req, options);
        expect(h.authorization).to.eq(undefined);
        expect(h.access_token).to.eq(undefined);
        expect(h.apikey).to.eq(undefined);
        expect(h.passwd).to.eq(undefined);
        expect(h.secret).to.eq(undefined);
        expect(h.api_key).to.eq(undefined);
    });
});