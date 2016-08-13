
import {Injectable, Component, ViewChild} from '@angular/core';
import {NavController} from 'ionic-angular';
import {TaskReporter} from '../../task/task-reporter';
import {TestSuiteServiceImpl} from '../../../services/testsuite/TestSuiteServiceImpl';
import {TestSuiteService} from '../../../services/testsuite/TestSuiteService';
import {FileSystem} from '../../../services/storage/FileSystem';
import {Feature} from '../../../models/Feature';
import {TaskHandler, ExecutionListener, TaskExecutor} from '../../task/TaskExecutor';
import {TaskInfo, ExecutionResult} from '../../task/TaskInfo';
import {GherkinService} from '../../../services/gherkin/GherkinService';
import {Metric} from '../../../models/Metric';
import {FeatureService} from '../../../services/feature/FeatureService';
import {TestSuite, ExecutionRuntime} from '../../../models/TestSuite';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {Severity, ErrorDetail} from '../../../error/ErrorDetail';
import {ErrorWithDetails} from '../../../error/ErrorWithDetails';
import {FeatureRepository} from '../../../repository/FeatureRepository';



@Injectable()
@Component({
  templateUrl: 'build/components/test-suite/import/test-suite-importer.html',
  directives: [TaskReporter],
  providers : [TestSuiteServiceImpl,GherkinService,FeatureServiceImpl,FileSystem,TaskReporter,FeatureRepository]

})
export class TestSuiteImporter implements TaskHandler, ExecutionListener {
  private projectFilePath: string;
  private testSuiteName: string;
  private projectFileName : string;
  private fileSystem: FileSystem;
  private gherkinService: GherkinService;
  private featureService: FeatureService;
  private importIntoAppFolder: boolean = false;
  @ViewChild(TaskReporter)
  private taskReporter : TaskReporter;

  private testSuiteService: TestSuiteService;
  constructor(private nav: NavController, testSuiteService: TestSuiteServiceImpl,
    fileSystem: FileSystem, gherkinService: GherkinService,
    featureService: FeatureServiceImpl) {
    console.log('explorer initialized')
    this.testSuiteService = testSuiteService;
    this.fileSystem = fileSystem;
    this.gherkinService = gherkinService;
    this.featureService = featureService;
  }

  onFileSelected(event) {
    this.projectFilePath = event.srcElement.files[0].path;
    this.projectFileName = event.srcElement.files[0].name;
    
  }

  import(event){
    this.testSuiteName = this.testSuiteService.getTestSuiteName(this.projectFilePath)
   
    let taskExecutor = new TaskExecutor("Import feature files from " + this.projectFileName, this)
    taskExecutor.addExecutionListener(this);
    let featureFiles = this.testSuiteService.listFeatureFiles(this.projectFilePath);

    featureFiles.forEach(file => {

      let pathElements: Array<string> = file.split(this.fileSystem.fileSeparator());
      let featureFileName = pathElements[pathElements.length - 1]
      taskExecutor.addTaskExecutionRequest(featureFileName, { "filepath": file, "testSuiteName": this.testSuiteName });

    });
    this.taskReporter.build(taskExecutor);
    this.taskReporter.start();
    console.log("task report completed");
  }

  check(taskInfo: TaskInfo): TaskInfo {
    try {
      let featureFilePath = taskInfo.getInputHolder().filepath;
      let testsuitename = taskInfo.getInputHolder().testSuiteName
      let featureAST = this.gherkinService.parse(featureFilePath);
      let feature = new Feature(featureAST, testsuitename, taskInfo.getSubject(), featureFilePath);

      let metrics: Array<Metric> = [];
      metrics.push(new Metric(feature.getId(),"Id"));
      metrics.push(new Metric(feature.getScenariosTotal().toString(),"Scenario"));
      metrics.push(new Metric( feature.getAutoScenariosTotal().toString(),"Auto"));
      taskInfo.setMetrics(metrics);

      taskInfo.setOutputHolder(feature);
      taskInfo.setExecutionResult(ExecutionResult.success);
    } catch (err) {
      taskInfo.setExecutionResult(ExecutionResult.error)
        if(err instanceof ErrorWithDetails)
          taskInfo.addErrorDetail(err.getDetail());
          else {
            let error = new ErrorDetail(err.name,err.message,Severity.blocker)
            taskInfo.addErrorDetail(error)
          }
    }

    return taskInfo;
  }
  process(taskInfo: TaskInfo): TaskInfo {
    try {
      this.featureService.save(taskInfo.getOutputHolder());
      taskInfo.setExecutionResult(ExecutionResult.success);
    } catch (err) {
      taskInfo.setExecutionResult(ExecutionResult.error)
     if(err instanceof ErrorWithDetails)
          taskInfo.addErrorDetail(err.getDetail());
          else {
            let error = new ErrorDetail(err.name,err.message,Severity.blocker)
            taskInfo.addErrorDetail(error)
          }
    }
    return taskInfo
  }

  beforeCheck(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void { }
  postCheck(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void { }
  beforeProcess(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {
    let testSuite: TestSuite = new TestSuite(this.testSuiteName, 
                                            false, null, 
                                            null, this.importIntoAppFolder,
                                            this.projectFilePath, ExecutionRuntime.ONELEO);

    tasks.forEach((task) => {
      let feature = <Feature>task.getOutputHolder()
      testSuite.incrementFeaturesCounter();
      if (feature.isAPI()) {
        testSuite.incrementApiTestCounter();
      } else {
        testSuite.incrementUiTestCounter()
      }
    })
    this.testSuiteService.save(testSuite);

  }
  postProcess(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void { }

}
