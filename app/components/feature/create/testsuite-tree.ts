import {OnInit, Component, Input,Output,EventEmitter} from '@angular/core';
import {TreeComponent, TreeModel,NodeEvent,RenamableNode} from 'ng2-tree';
import {FileSystem} from '../../../services/storage/FileSystem';
import {TestSuite} from '../../../models/TestSuite';


@Component({
  selector: 'tsp-testsuite-tree',
  templateUrl: 'build/components/feature/create/testsuite-tree.html',
  directives: [TreeComponent]

})
export class TestSuiteTree implements OnInit {

  @Input() testsuite: TestSuite;
  @Output() folderSelected  = new EventEmitter<string>()
  @Output() folderCreated = new EventEmitter<string>()


  /*private tree: TreeModel = {
      value: 'Programming languages',
      children: [
        {
          value: 'Object-oriented programming',
          children: [
            {value: 'Java'},
            {value: 'C++'},
            {value: 'C#'},
          ]
        },
        {
          value: 'Prototype-based programming',
          children: [
            {value: 'JavaScript'},
            {value: 'CoffeeScript'},
            {value: 'Lua'},
          ]
        }
      ]
    }; */

  private tree: TreeModel
  constructor(private fileSystem: FileSystem) {


  }

  ngOnInit() {
    let tempTree :TreeModel = this.fileSystem.buildDirTree(this.testsuite.TestSuiteDir)
    //Set test suite name as repo
    tempTree.value = this.testsuite.getName()
    this.tree = tempTree


  }

  private onNodeSelected(nodeEvent: NodeEvent){
    /*Check if it is a folder
    if(nodeEvent.node.children === undefined || nodeEvent.node.children.length === 0)
    return */
    
    
    //It is a folder
    let folderPath = (<any>nodeEvent.node.value).name
    this.folderSelected.emit(folderPath)
  }

  private  onNodeCreated(nodeEvent: NodeEvent){
   
    
    //It is a folder
    let folderPath = (<any>nodeEvent.node.value).name
    this.folderCreated.emit(folderPath)
  }

  
}