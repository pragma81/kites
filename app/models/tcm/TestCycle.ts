import {Injectable} from '@angular/core';
import {TestCase} from './TestCase';

@Injectable()
export class TestCycle {
    private testCases : Array<TestCase>
}